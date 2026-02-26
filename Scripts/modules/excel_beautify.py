from openpyxl import load_workbook
from openpyxl.styles import Alignment, Font
from utils.paths import PATHS

wb = load_workbook(PATHS['documents'] / 'Dataset.xlsx')
sheet = wb.active

#? Setting widths of the columns 
sheet.column_dimensions['A'].width = 40
sheet.column_dimensions['B'].width = 25
sheet.column_dimensions['C'].width = 15
sheet.column_dimensions['D'].width = 100
sheet.column_dimensions['E'].width = 20
sheet.column_dimensions['F'].width = 20

sheet.row_dimensions[1].height = 50
#?setting alignment of the contents in the columns
align_1 = Alignment(horizontal = 'left' , vertical='center')
align_2 = Alignment(horizontal = 'center' , vertical= 'center' , wrapText=True)


for cell in sheet['A']:
    cell.alignment = align_1

for cell in sheet['B']:
    cell.alignment = align_2

for cell in sheet['C']:
    cell.alignment = align_2

for cell in sheet['D']:
    cell.alignment = align_2

for cell in sheet['E']:
    cell.alignment = align_2

for cell in sheet['F']:
    cell.alignment = align_2

#?formatting the header row
sheet['A1'].alignment = align_2
for cell in sheet[1][:6]: 
    cell.font = Font(size=14, bold=True)

#applying the changes
wb.save(PATHS['documents'] / 'Dataset.xlsx')