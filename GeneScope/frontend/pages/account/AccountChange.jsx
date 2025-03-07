import React from "react";
import "./AccountChange.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";

const AccountChange = ({ isLoggedIn, setIsLoggedIn }) => {

  return (
    <div className="account-page">
    <div className="account-change-page">
    <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
    <div className="update-password-container">
      {/* Top-right Logout Button */}
      {/* <div className="logout-button-container">
        <button className="logout-button">Logout</button>
      </div> */}

      <h1 className="update-password-title">Update Password</h1>
      {/* Logo and Title */}
      <img src={GeneScopeLogo} alt="Genescope Logo" className="logo-image"/>
      {/* Form */}
      <form className="update-password-form">
        <input
          type="password"
          placeholder="Old Password"
          className="password-input"
        />
        <input
          type="password"
          placeholder="New Password"
          className="password-input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="password-input"
        />
        <button type="submit" className="confirm-button">
          Confirm
        </button>
      </form>
    </div>
  </div>
  </div>
  );
};

export default AccountChange;


/*
Code for generating data for the model, put it here for testing purposes
Under it is the code for the gpt 2 model and its code to test the model
Tested the code for incorporation and it should work

from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from autocorrect import Speller
import json
import random
import os

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit")
model = AutoModelForCausalLM.from_pretrained(
    "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
    torch_dtype=torch.float16,
    device_map="auto"
)

spell = Speller(lang='en')

json_filename = "trainingData.json"

for i in range(2000):
    popularity_score = random.uniform(0, 100)
    stability_score = random.uniform(0, 100)
    structure_score = random.uniform(0, 100)

    # Create the prompt with actual scores
    prompt = (
        "Experiment Final Scores:\n"
        f"Popularity Score: {popularity_score}\n"
        f"Stability Score: {stability_score}\n"
        f"Structure Score: {structure_score}\n\n"
        "Based solely on these scores, write a concise, reader-friendly summary that explains what each score means and provides meaningful insights into the aptamer selection process. "
        "Clearly define the following:\n"
        "1. The Popularity Score reflects the abundance and clustering of sequences—indicating how frequently certain aptamer candidates appear and how they group together, which may suggest the level of convergence in the selection library.\n"
        "2. The Stability Score, derived from thermodynamic free energy calculations, shows how likely the sequences are to maintain their structure under varying conditions; a higher score indicates more robust binding potential.\n"
        "3. The Structure Score evaluates the quality and presence of conserved secondary structure motifs, such as hairpin loops, which are essential for aptamer functionality.\n\n"
        "Provide your response in exactly two paragraphs (no more than 5 sentences each) with essential analysis and recommendations. "
        "Proofread your response for perfect spelling and grammar. Ensure the final sentence is complete."
    )

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    # Generate the response with correct settings
    outputs = model.generate(
        inputs.input_ids,
        max_new_tokens=300,    # Limit output to avoid unnecessary verbosity
        num_beams=5,           # More deterministic text generation
        no_repeat_ngram_size=2,
        early_stopping=True,
        do_sample=False        # Fully deterministic (remove temperature/top_p warnings)
    )

    # Decode the generated text and run spell-check
    generated_text = tokenizer.decode(outputs[0][inputs.input_ids.shape[-1]:], skip_special_tokens=True)
    corrected_text = spell(generated_text)

    example = {
        "popularity_score": popularity_score,
        "stability_score": stability_score,
        "structure_score": structure_score,
        "feedback": corrected_text
    }
    # Append to JSON file without overwriting existing data
    if os.path.exists(json_filename):
        with open(json_filename, "r+") as f:
            try:
                data = json.load(f)  # Load existing data
                if not isinstance(data, list):  # Ensure it's a list
                    data = []
            except json.JSONDecodeError:
                data = []
            data.append(example)  # Append new example
            f.seek(0)  # Reset file position to beginning
            json.dump(data, f, indent=4)  # Write updated list
            f.truncate()  # Remove any leftover content
    else:
        with open(json_filename, "w") as f:
            json.dump([example], f, indent=4)  # Create new file with the first example

    print(f"Example {i} added.")

print("Data saved to", json_filename)

GPT-2 Model training code
# import os
# from datasets import load_dataset
# from transformers import (
#     GPT2LMHeadModel,
#     GPT2Tokenizer,
#     DataCollatorForLanguageModeling,
#     Trainer,
#     TrainingArguments,
# )

# def fine_tune_gpt2(training_file, output_dir, epochs=3, batch_size=2):
#     # Load pre-trained GPT-2 model & tokenizer
#     tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
#     model = GPT2LMHeadModel.from_pretrained("gpt2")

#     # Fix padding issues (GPT-2 doesn't use padding tokens by default)
#     tokenizer.pad_token = tokenizer.eos_token
#     tokenizer.padding_side = "left"

#     # Load dataset from text file
#     dataset = load_dataset("text", data_files={"train": training_file})

#     # Tokenize dataset (truncating to model's max token length)
#     def tokenize_function(examples):
#         return tokenizer(
#             examples["text"],
#             truncation=True,  # Ensures proper truncation
#             padding="max_length",
#             max_length=tokenizer.model_max_length
#         )

#     tokenized_datasets = dataset.map(tokenize_function, batched=True, remove_columns=["text"])

#     # Data collator to handle batch tokenization
#     data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

#     # Training arguments
#     # training_args = TrainingArguments(
#     #     output_dir=output_dir,
#     #     overwrite_output_dir=True,
#     #     num_train_epochs=epochs,
#     #     per_device_train_batch_size=batch_size,
#     #     save_steps=500,
#     #     save_total_limit=2,
#     #     prediction_loss_only=True,
#     #     logging_dir=os.path.join(output_dir, "logs"),
#     #     logging_steps=100,
#     #     save_strategy="epoch",
#     #     evaluation_strategy="no",
#     # )
#     training_args = TrainingArguments(
#         output_dir=output_dir,
#         num_train_epochs=5,  # Increase epochs for better training
#         per_device_train_batch_size=2,
#         learning_rate=5e-5,  # Lower learning rate
#         save_steps=500,
#         save_total_limit=2
#     )

#     # Initialize Trainer
#     trainer = Trainer(
#         model=model,
#         args=training_args,
#         data_collator=data_collator,
#         train_dataset=tokenized_datasets["train"],
#     )

#     # Fine-tune the model
#     trainer.train()

#     # Save fine-tuned model & tokenizer
#     model.save_pretrained(output_dir)
#     tokenizer.save_pretrained(output_dir)

#     print(f"Fine-tuned model and tokenizer saved to {output_dir}")

# if __name__ == "__main__":
#     training_file = "training_data.txt"  # Use the text file converted from JSON
#     output_dir = "./fine_tuned_gpt2"
    
#     fine_tune_gpt2(training_file, output_dir)
import os
from transformers import (
    GPT2LMHeadModel,
    GPT2Tokenizer,
    TextDataset,
    DataCollatorForLanguageModeling,
    Trainer,
    TrainingArguments,
)

def fine_tune_gpt2(training_file, output_dir, epochs=3, block_size=128, batch_size=1):
    # Load the pre-trained GPT-2 tokenizer and model
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model = GPT2LMHeadModel.from_pretrained("gpt2")

    # Create a TextDataset from your training file.
    dataset = TextDataset(
        tokenizer=tokenizer,
        file_path=training_file,
        block_size=block_size,
    )

    # Create a data collator for language modeling.
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )

    # Define training arguments.
    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=True,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        save_steps=500,
        save_total_limit=2,
        prediction_loss_only=True,
    )

    # Initialize the Trainer.
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=dataset,
    )

    # Fine-tune the model.
    trainer.train()
    
    # Save the fine-tuned model.
    trainer.save_model(output_dir)
    print(f"Fine-tuned model saved to {output_dir}")

if __name__ == "__main__":
    # Path to the training text file converted from JSON
    training_file = "training_data.txt"  # Use the file generated above.
    output_dir = "./fine_tuned_gpt2"
    
    fine_tune_gpt2(training_file, output_dir)

#Code for running the generator
############################################################################################

# from transformers import GPT2Tokenizer

# # Define the path to your fine-tuned model directory
# model_path = "./fine_tuned_gpt2"

# # Load the tokenizer from the base GPT-2 model
# tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# # Save the tokenizer to the fine-tuned model directory
# tokenizer.save_pretrained(model_path)

# print(f"Tokenizer saved to {model_path}")

############################################################################################

import os, re
from transformers import GPT2LMHeadModel, GPT2Tokenizer, pipeline

def generate_feedback(popularity, stability, structure, model_path="./fine_tuned_gpt2", max_length=300):
    # Convert to absolute path
    model_path = os.path.abspath(model_path)

    # Load the fine-tuned tokenizer and model
    tokenizer = GPT2Tokenizer.from_pretrained(model_path, local_files_only=True)
    model = GPT2LMHeadModel.from_pretrained(model_path, local_files_only=True)
    
    # Create a text generation pipeline
    text_generator = pipeline("text-generation", model=model, tokenizer=tokenizer)
    
    # Create an enhanced prompt that instructs the model to use the scores
    prompt = (
        "Given the following scores for an aptamer selection experiment, "
        "analyze what each score indicates and provide detailed, tailored insights and recommendations.\n\n"
        f"Popularity Score: {popularity}\n"
        f"Stability Score: {stability}\n"
        f"Structure Score: {structure}\n\n"
        "Feedback: "
    )
    
    # Generate text based on the prompt with adjusted parameters
    output = text_generator(
        prompt,
        max_length=max_length,
        do_sample=True,
        temperature=0.7,
        top_k=50,
        top_p=0.95,
        num_return_sequences=1,
        eos_token_id=tokenizer.eos_token_id
    )
    
    return output[0]['generated_text']

def clean_generated_text(text):
    # Remove numbers (including decimals)
    text_no_numbers = re.sub(r'\d+(\.\d+)?', '', text)
    # Remove all percent signs
    text_clean = text_no_numbers.replace('%', '')
    # Optionally, remove extra whitespace
    text_clean = re.sub(r'\s+', ' ', text_clean).strip()
    return text_clean

# Example usage:
if __name__ == "__main__":
    popularity = 57.3
    stability = 81.1
    structure = 44.7
    
    generated_text = generate_feedback(popularity, stability, structure)
    print("Generated Feedback:\n")
    clean_text = clean_generated_text(generated_text)
    print(clean_text)
*/