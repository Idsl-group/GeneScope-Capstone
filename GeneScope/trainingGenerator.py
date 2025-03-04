from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from autocorrect import Speller

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit")
model = AutoModelForCausalLM.from_pretrained(
    "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
    torch_dtype=torch.float16,
    device_map="auto"
)

spell = Speller(lang='en')


import random

training_examples = []
for i in range(1000):
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
    training_examples.append(example)
    print(f"Example {i}\n")

print(training_examples)