import {PDFParse} from 'pdf-parse';

export async function extractTextFromPDF(filepath:string) {
  const parser = new PDFParse({url:filepath});
  const result = await parser.getText();
  console.log(result.text);
  return result.text;
}
