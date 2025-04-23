import chatbot

def main():
    print("Welcome to the RAG Chatbot! Type ''exit'' to end the conversation.")

    while True:
        query = input("You [如要離開，鍵入'exit'，再按「輸入」鍵]: ")
        if query.lower() == 'exit':
            print("Goodbye!")
            break
        response = chatbot.rag_conv(query)
        print(f"Chatbot: {response}")

if __name__ == "__main__":
    main()