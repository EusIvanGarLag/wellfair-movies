import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100 shadow-sm border-0 bg-dark text-white rounded-3 overflow-hidden position-relative">
      <div class="position-relative">
        <img 
          [src]="posterUrl" 
          [alt]="movie.title" 
          class="card-img-top object-fit-cover" 
          style="height: 380px; width: 100%; display: block;"
          (error)="onImageError($event)"
        >
        <!-- Botón de Favorito (Corazón) -->
        <button 
          (click)="onFavoriteClick($event)" 
          class="btn btn-sm btn-dark position-absolute top-0 start-0 m-2 rounded-circle shadow-sm border-0"
          [title]="isFav ? 'Quitar de Favoritos' : 'Agregar a Favoritos'">
          <i class="bi" [ngClass]="isFav ? 'bi-heart-fill text-danger' : 'bi-heart text-white'"></i>
        </button>

        <span class="position-absolute top-0 end-0 badge bg-warning text-dark m-2 fs-6">
          <i class="bi bi-star-fill me-1"></i>{{ movie.vote_average | number:'1.1-1' }}
        </span>
      </div>

      <div class="card-body d-flex flex-column justify-content-between">
        <div>
          <h6 class="card-title text-truncate" [title]="movie.title">{{ movie.title }}</h6>
          <p class="card-text text-white-50 small mb-2">
            <i class="bi bi-calendar3 me-1"></i>{{ movie.release_date || 'Sin fecha' }}
          </p>
        </div>
        <button (click)="onDetailsClick()" class="btn btn-outline-light btn-sm w-100 mt-2">
          <i class="bi bi-info-circle me-1"></i> Detalles
        </button>
      </div>
    </div>
  `
})
export class MovieCardComponent implements OnInit {
  @Input({ required: true }) movie!: Movie;
  @Output() selectMovie = new EventEmitter<number>();
  @Output() favoriteToggled = new EventEmitter<void>();

  private movieService: MovieService = inject(MovieService);
  isFav: boolean = false;
  private fallbackSvg = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" fill="%23333" viewBox="0 0 16 16"%3E%3Crect width="100%25" height="100%25" fill="%23212529"/%3E%3Ctext x="50%25" y="50%25" fill="%23aaa" dy=".3em" text-anchor="middle" font-family="sans-serif" font-size="24"%3ESin Poster%3C/text%3E%3C/svg%3E';

  ngOnInit(): void {
    this.isFav = this.movieService.isFavorite(this.movie.id);
  }

  get posterUrl(): string {
    return this.movieService.getImageUrl(this.movie.poster_path);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.fallbackSvg;
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.isFav = this.movieService.toggleFavorite(this.movie);
    this.favoriteToggled.emit();
  }

  onDetailsClick(): void {
    this.selectMovie.emit(this.movie.id);
  }
}