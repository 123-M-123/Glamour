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
    // Leemos directamente desde la función que conecta con Google Sheets
    return await getProductsFromSheets();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}