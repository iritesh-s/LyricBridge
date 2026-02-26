import pandas as pd;
from utils.paths import PATHS

file = pd.read_json(PATHS['assets'] / 'lyrics_data.json')
if file.empty == False :
    file = file.rename(columns={'status' : 'Status' , 'lyrics' : 'Lyrics' , 'lrc' : 'LRC Status'})
    file['Lyrics'] = file['Lyrics'].str.replace('\n', ' ', regex=False).str.slice(0, 32000)
    file = file.sort_values(by='Status').reset_index(drop=True)
    #file
    #? print(file)
    
    # Editing the excel dataframe
    excel_path = PATHS['documents'] / 'Dataset.xlsx'

    existing_data = pd.read_excel(excel_path)


    existing_data = existing_data[existing_data['Status'].isin(['Synced', 'Plain'])]


    # #? print(existing_data)

    new = pd.concat([existing_data, file])
    new['LRC Status'] = new['LRC Status'].astype(bool)
    #? print(new)

    #exporting to excel
    new.to_excel(excel_path, index=False, engine='openpyxl')


print("Updated the Excel File!")