import tiktoken
enc = tiktoken.get_encoding("cl100k_base")
assert enc.decode(enc.encode("hello world")) == "hello world"

# To get the tokeniser corresponding to a specific model in the OpenAI API:
enc = tiktoken.encoding_for_model("gpt-4")

# Encode the file and print the token count
file_path = "clean.txt"
with open(file_path, "r") as file:
    content = file.read()
encoded_content = enc.encode(content)
token_count = len(encoded_content)
print("Token count:", token_count)

