import { getProductsFromSheets } from './googleSheets';

export async function getProducts() {
  try {
    return await getProductsFromSheets();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}