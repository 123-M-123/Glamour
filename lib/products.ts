// lib/products.ts (EL CAMPITO)
import { getProductsFromSheets } from './googleSheets';

export interface Product {
  id_producto: string;
  titulo: string;
  precio: number;
  descripcion: string;
  imagen?: string;
  categoria?: string;
  etiqueta?: string;
  stock?: number;
}

export async function getProducts(): Promise<Product[]> {
  try {
    // YA NO LEEMOS DEL JSON LOCAL (fs y path quedan fuera)
    // Ahora llamamos a la función que conecta con Google Sheets
    const productsFromSheets = await getProductsFromSheets();
    
    return productsFromSheets;
  } catch (error) {
    console.error('Error fetching products from Sheets:', error);
    return [];
  }
}