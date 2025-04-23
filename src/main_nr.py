#main_nr.py

'''This module has no RAG, it is the base LLM'''
import chatbot

def main_nr():
    print("Welcome to the RAG Chatbot! Type ''exit'' to end the conversation.")

    while True:
        query = input("You [如要離開，鍵入'exit'，再按「輸入」鍵]: ")
        if query.lower() == 'exit':
            print("Goodbye!")
            break
        response = chatbot.noRag_conv(query)
        print(f"Chatbot: {response}")

if __name__ == "__main__":
    main_nr()