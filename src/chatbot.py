import os
import sys

# exception could happen when forgetting to install the packages
# or the system does not have a GPU
try:
    from langchain_huggingface import HuggingFaceEmbeddings, ChatHuggingFace, HuggingFaceEndpoint
    from langchain.vectorstores.faiss import FAISS
    from langchain.docstore.document import Document #allow storing material in a user-friendly way
    from langchain_core.messages import HumanMessage, SystemMessage
    from IPython.display import Markdown, display
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)


def read_api_token_in_key_directory(filename='hf_token.txt'):
    """
    Reads the token from a specific file located in a sibling directory named 'key'.
    The 'key' directory should be at the same level as the 'src' directory.
    """
    api_token = None

    # Navigate to the sibling 'key' subdirectory
    current_dir = os.getcwd()
    parent_dir = os.path.dirname(current_dir)
    key_dir = os.path.join(parent_dir, 'key')
    
    # Path to the API token file
    token_file_path = os.path.join(key_dir, filename)
    
    # Check if the file exists and read the API token
    if os.path.exists(token_file_path):
        with open(token_file_path, 'r') as file:
            api_token = file.readline().strip()
    
    return api_token

hf_token = read_api_token_in_key_directory('hf_token.txt')
os.environ['HUGGINGFACEHUB_API_TOKEN'] = hf_token

import retriever
# Navigate to the sibling 'key' subdirectory
current_dir = os.getcwd()
parent_dir = os.path.dirname(current_dir)
documents_dir = os.path.join(parent_dir, 'documents')
aug_docs = retriever.Retriever(documents_dir).aug_docs
docs = [Document(page_content=text) for text in aug_docs] # digest the given material, store in the specific format, and keep as a 'docs' object

# leverage a base model LLM
llm_base = HuggingFaceEndpoint(repo_id="microsoft/Phi-3.5-mini-instruct", task="text-generation") # Dependency: langchain_huggingface.HuggingFaceEmbeddings
c_model = ChatHuggingFace(llm=llm_base)

# Use a favourable embedding model
e_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

# Use the FAISS, a vector store
faiss_db = FAISS.from_documents(documents=docs, embedding=e_model)

#retrieve
def retrieve_similar_content(query, k = 4):
  docs_faiss = faiss_db.similarity_search(query, k)
  return docs_faiss

# have a function to allow conversation
def make_conversation(query, context):
  messages = [
      SystemMessage(content=f"You are an agent catering Mainland Chinese students to study at Hong Kong. You just answer queries based on {context}. If the information is not in the context, you must say you don't know, then you stop saying anything more."),
      HumanMessage(content=f'''Answer the {query} based on the {context}''')
  ]
  reply = c_model.invoke(messages)
  return reply.content

def rag_conv(query):
  context = retrieve_similar_content(query)
  return make_conversation(query, context)


# have a control function to compare
def make_conversation_noContext(query):
  messages = [
      SystemMessage(content=f"You are an agent catering Mainland Chinese students to study at Hong Kong. You try to answer queries with your knowledge."),
      HumanMessage(content=f'''Answer the {query}''')
  ]
  reply = c_model.invoke(messages)
  return reply.content

def noRag_conv(query):
  return make_conversation_noContext(query)