# com6104gppj

## Step1: install necessary packages
- (recommended) activate a dedicate environment, then run:
- !pip install faiss-cpu langchain-huggingface sentence-transformers langchain-community -q

## Step2: ensure you got the key-src-documents trio folders
- In terminal, run the following commands
- git clone <repo>
- (in case the three folders is not on main, but on ABC) git checkout ABC

## Step3: Ensure the files in /documents are good enough
- Suggest to make individual and NON-duplicated topic, and have more points in one topic
- In each file, it must be markdown file (.md), and in a format of: -
- Having one hash one space then blahblahblah to denote the main topic, e.g. # Mobile Phone Market
- 
- Having two hashes one space then blahblahblah to denote a subtopic, e.g. ## iPhone
- Having three hashes one space then blahblahblah to denote a "topic of a remark", e.g. Screencap buttons
- Having a hypen one space then blahblahblah to denote the content of a subtopic or content of a remark
- There must be an empty row to separate main topic / subtopic / topic of a remark / content

## Step4A: Run LLM with RAG
- Run these command: -
- cd src
- python -m main

## or Step4B: Run LLM (base model)
- Run these command: -
- cd src
- python -m main_nr