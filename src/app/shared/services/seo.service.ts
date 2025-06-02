import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private defaultTitle = 'Bel Régia Map';
  private defaultDescription = 'Descubra os principais pontos turísticos de Belém do Pará com o Bel Régia Map, um guia interativo criado para a COP30.';
  private defaultImage = 'https://res.cloudinary.com/ddq5wmlws/image/upload/v1748901934/Bel_regia_map_com_nome_e0a76e9d24.png';
  private defaultUrl = environment.loginRedirect;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  updateTags({
               title,
               description,
               image,
               url
             }: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  }) {
    const pageTitle = title;
    const pageDescription = description || this.defaultDescription;
    const pageImage = image || this.defaultImage;
    const pageUrl = url || this.defaultUrl;

    this.titleService.setTitle(pageTitle ? `${ pageTitle } | ${ this.defaultTitle }` : this.defaultTitle);

    this.metaService.updateTag({ name: 'description', content: pageDescription });
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: pageDescription });
    this.metaService.updateTag({ property: 'og:image', content: pageImage });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });

    this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: pageDescription });
    this.metaService.updateTag({ name: 'twitter:image', content: pageImage });

    this.setCanonicalUrl(pageUrl);
  }

  private setCanonicalUrl(url: string) {
    let link: HTMLLinkElement = this.document.querySelector('link[rel=\'canonical\']') || this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }
}
