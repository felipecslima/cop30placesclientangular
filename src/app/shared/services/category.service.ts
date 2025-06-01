import { Injectable } from '@angular/core';
import { IconInfo } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly icons: IconInfo[] = [
    {
      icon: 'nature_people',
      color: '#9AE600',
      category: 'Lazer',
      colorText: '#000000'
    },
    {
      icon: 'history_edu',
      color: '#FF6900',
      category: 'Cultura',
      colorText: '#000000'
    },
    {
      icon: 'dining',
      color: '#FDC700',
      category: 'Gastronomia',
      colorText: '#000000'
    },
    {
      icon: 'shopping_cart',
      color: '#9810FA',
      category: 'Comercial',
      colorText: '#FFFFFF'
    },
    {
      icon: 'boat_bus',
      color: '#00A6F4',
      category: 'Infraestrutura',
      colorText: '#000000'
    }
  ];

  getIconByCategory(category: string): IconInfo | undefined {
    return this.icons.find(icon => icon.category.toLowerCase() === category.toLowerCase());
  }

  getAllCategories(): Record<string, { icon: string; color: string; colorText: string }> {
    return {
      Comercial: this.icons.find(icon => icon.category.toLowerCase() === 'comercial'),
      Cultura: this.icons.find(icon => icon.category.toLowerCase() === 'cultura'),
      Gastronomia: this.icons.find(icon => icon.category.toLowerCase() === 'gastronomia'),
      Infraestrutura: this.icons.find(icon => icon.category.toLowerCase() === 'infraestrutura'),
      Lazer: this.icons.find(icon => icon.category.toLowerCase() === 'lazer')
    };
  }
}
