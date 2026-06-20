import fitz

# Extract Student Book
doc = fitz.open('Complete PET SB (2020).pdf')
print('=== COMPLETE PET STUDENT BOOK ===')
print('TOTAL PAGES:', doc.page_count)
for i in range(min(30, doc.page_count)):
    text = doc[i].get_text('text')
    blocks = doc[i].get_text('blocks')
    print(f'\n--- SB PAGE {i+1} ---')
    print('raw text len:', len(text))
    for b in blocks[:10]:
        print(repr(b[4][:200]))

doc.close()
