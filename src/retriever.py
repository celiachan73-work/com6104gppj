import os
import re

class Retriever:
    def __init__(self, doc_lib):
        self.doc_lib = doc_lib
        self.aug_docs = self.process_documents()

    def process_documents(self):
        """
        Processes Markdown files in the specified directory to extract structured information.
        Returns:
            List of augmented documents with structured information.
        """
        doc_lib = self.doc_lib
        aug_docs = []
        # Iterate through all files in the specified directory
        for filename in os.listdir(doc_lib): # Dependency (package): os
            if filename.endswith(".md"):
                md_path = os.path.join(doc_lib, filename)
                # Read the contents of the Markdown file
                with open(md_path, "r", encoding="utf-8") as file:
                    markdown_content = file.read()

            # Initialize variables to store the extracted information
            header = ""
            subheading = ""
            subsubheading = ""
            content = ""
            aug_docs = []

            # Regular expressions to match different elements in the Markdown file
            header_pattern = re.compile(r"# (.+)") # Dependency (package): re
            subheading_pattern = re.compile(r"## (.+)")
            subsubheading_pattern = re.compile(r"### (.+)")
            content_pattern = re.compile(r"- ((?s:.)+)")

            # Split the Markdown content into blocks based on the list items
            split_pattern = re.compile(r"\n\n")
            blocks = re.split(split_pattern, markdown_content)

            # Process each block to extract the relevant information
            counter = 0
            subsubheading_at = 0
            for block in blocks:
                if header_pattern.match(block):
                    header = header_pattern.match(block).group(1)
                elif subheading_pattern.match(block):
                    subheading = subheading_pattern.match(block).group(1); subheading_counter = counter;
                    if subheading_counter > subsubheading_at:
                        subsubheading = None
                elif subsubheading_pattern.match(block):
                    subsubheading = subsubheading_pattern.match(block).group(1); subsubheading_at = counter;
                elif content_pattern.match(block):
                    content = content_pattern.match(block).group(1)
                    if subsubheading:
                        aug_docs.append(f"關於 {header}, {subheading}, 當中 \"{subsubheading}\" 是指 {content}")
                    else:
                        aug_docs.append(f"關於 {header}, {subheading}, {content}")
                counter = counter + 1
        
        return aug_docs