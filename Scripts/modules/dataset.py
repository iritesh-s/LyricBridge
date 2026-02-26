import pandas as pd;
from utils.paths import PATHS

file = pd.read_json(PATHS['assets'] / 'lyrics_data.json')
if file.empty == False:
    file = file.rename(columns={'status' : 'Status' , 'lyrics' : 'Lyrics' , 'lrc' : 'LRC Status'})
    file['Lyrics'] = file['Lyrics'].str.replace('\n', ' ', regex=False).str.slice(0, 32000)
    file = file.sort_values(by='Status').reset_index(drop=True)
    file['LRC Status'] = file['LRC Status'].astype(bool)

#? print(file)
 
# Editing the excel dataframe
excel_path = PATHS['documents'] / 'Dataset.xlsx'

#? print(existing_data)
 
#? print(file)

#exporting to excel
file.to_excel(excel_path, index=False, engine='openpyxl')
print("Updated the Excel File!")

#!checkpoint