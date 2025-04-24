from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings, ChatHuggingFace, HuggingFaceEndpoint
from langchain.vectorstores.faiss import FAISS
from langchain.docstore.document import Document
from langchain_core.messages import HumanMessage, SystemMessage
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Hugging Face token
hf_token = os.getenv('HUGGINGFACE_TOKEN')
os.environ['HUGGINGFACEHUB_API_TOKEN'] = hf_token

def load_markdown_files(directory):
    aug_docs = []
    for filename in os.listdir(directory):
        if filename.endswith(".md"):
            md_path = os.path.join(directory, filename)
            with open(md_path, "r", encoding="utf-8") as file:
                markdown_content = file.read()

            # Initialize variables
            header = ""
            subheading = ""
            subsubheading = ""
            
            # Regular expressions
            header_pattern = re.compile(r"# (.+)")
            subheading_pattern = re.compile(r"## (.+)")
            subsubheading_pattern = re.compile(r"### (.+)")
            content_pattern = re.compile(r"- ((?s:.)+)")

            # Split content into blocks
            blocks = re.split(r"\n\n", markdown_content)
            
            counter = 0
            subsubheading_at = 0
            for block in blocks:
                if header_pattern.match(block):
                    header = header_pattern.match(block).group(1)
                elif subheading_pattern.match(block):
                    subheading = subheading_pattern.match(block).group(1)
                    subheading_counter = counter
                    if subheading_counter > subsubheading_at:
                        subsubheading = None
                elif subsubheading_pattern.match(block):
                    subsubheading = subsubheading_pattern.match(block).group(1)
                    subsubheading_at = counter
                elif content_pattern.match(block):
                    content = content_pattern.match(block).group(1)
                    if subsubheading:
                        aug_docs.append(f"關於 {header}, {subheading}, 當中 \"{subsubheading}\" 是指 {content}")
                    else:
                        aug_docs.append(f"關於 {header}, {subheading}, {content}")
                counter += 1
    
    return aug_docs

# Load documents
docs_dir = "../data"
aug_docs = load_markdown_files(docs_dir)
docs = [Document(page_content=text) for text in aug_docs]

# Initialize models
e_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
faiss_db = FAISS.from_documents(documents=docs, embedding=e_model)
llm_base = HuggingFaceEndpoint(repo_id="microsoft/Phi-3.5-mini-instruct", task="text-generation")
c_model = ChatHuggingFace(llm=llm_base)

def retrieve_similar_content(query, k=4):
    docs_faiss = faiss_db.similarity_search(query, k)
    return docs_faiss

def make_conversation(query, context, use_rag=True):
    try:
        if use_rag:
            messages = [
                SystemMessage(content=f"You are an agent catering Mainland Chinese students to study at Hong Kong. You just answer queries based on {context}. If the information is not in the context, you must say you don't know, then you stop saying anything more."),
                HumanMessage(content=f'''Answer the {query} based on the {context}''')
            ]
        else:
            messages = [
                SystemMessage(content="You are an agent catering Mainland Chinese students to study at Hong Kong. You try to answer queries with your knowledge."),
                HumanMessage(content=query)
            ]
        
        reply = c_model.invoke(messages)
        return reply.content
    except Exception as e:
        print(f"Error in make_conversation: {str(e)}")
        return "抱歉，處理您的請求時出現問題。請稍後再試。"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        query = data.get('message')
        use_rag = data.get('useRag', True)
        
        if not query:
            return jsonify({'error': 'No message provided'}), 400

        if use_rag:
            context = retrieve_similar_content(query)
            response = make_conversation(query, context, use_rag=True)
        else:
            response = make_conversation(query, None, use_rag=False)
            
        return jsonify({
            'response': response,
            'mode': 'RAG' if use_rag else 'Basic'
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': '服務器錯誤，請稍後再試。'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)