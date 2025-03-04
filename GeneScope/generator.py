import os
from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments, DataCollatorForSeq2Seq
from torch.utils.data import Dataset

# 1. Prepare a custom dataset
class AptamerFeedbackDataset(Dataset):
    def __init__(self, data, tokenizer, max_input_length=64, max_output_length=256):
        self.data = data
        self.tokenizer = tokenizer
        self.max_input_length = max_input_length
        self.max_output_length = max_output_length
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        # Construct input text prompt from scores
        input_text = f"Scores: popularity {item['popularity_score']}, stability {item['stability_score']}, structure {item['structure_score']}."
        target_text = item['feedback']
        
        # Tokenize inputs and outputs
        model_inputs = self.tokenizer(input_text, max_length=self.max_input_length, truncation=True, padding="max_length", return_tensors="pt")
        labels = self.tokenizer(target_text, max_length=self.max_output_length, truncation=True, padding="max_length", return_tensors="pt")
        
        # Remove batch dimension
        model_inputs = {key: val.squeeze() for key, val in model_inputs.items()}
        labels = labels.input_ids.squeeze()
        model_inputs["labels"] = labels
        return model_inputs

# Example training data
# In practice, replace these with your curated examples.
training_data = [
    {
        "popularity_score": 85,
        "stability_score": 40,
        "structure_score": 70,
        "feedback": "The candidate shows high popularity, indicating strong selection or frequent occurrence. However, its stability is moderate; consider optimizing the conditions or sequence modifications to improve robustness. Structural aspects are above average, suggesting that further refinements in secondary structure may boost binding efficiency."
    },
    {
        "popularity_score": 50,
        "stability_score": 75,
        "structure_score": 65,
        "feedback": "The sequence has moderate popularity but high stability, which is promising. Structural aspects are decent but could benefit from minor adjustments. Consider fine-tuning the sequence for better popularity without compromising stability."
    },
]

# 2. Load tokenizer and model
model_name = "t5-small"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

# 3. Prepare dataset and data collator
train_dataset = AptamerFeedbackDataset(training_data, tokenizer)
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# 4. Set training arguments
training_args = TrainingArguments(
    output_dir="./aptamer_feedback_model",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    save_steps=500,
    save_total_limit=2,
    logging_steps=100,
    learning_rate=5e-5,
    weight_decay=0.01,
    evaluation_strategy="no",  # Use evaluation_strategy="steps" and add eval_dataset if you have validation data
)

# 5. Initialize Trainer and start training
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    data_collator=data_collator,
)

trainer.train()

# 6. Inference function
def generate_feedback(popularity, stability, structure, max_length=150):
    input_text = f"Scores: popularity {popularity}, stability {stability}, structure {structure}."
    input_ids = tokenizer.encode(input_text, return_tensors="pt", max_length=64, truncation=True)
    output_ids = model.generate(input_ids, max_length=max_length, num_beams=5, early_stopping=True)
    feedback = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return feedback

# Example usage:
example_feedback = generate_feedback(80, 60, 75)
print("Generated Feedback:")
print(example_feedback)