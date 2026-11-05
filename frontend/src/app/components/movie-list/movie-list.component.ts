import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { MovieService } from '../../core/services/movie.service';
import { Movie, Genre, Review, TMDBResponse } from '../../core/models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';

declare var bootstrap: any;

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent],
  template: `
    <div class="container py-4">
      <!-- Filtros Superiores & Pestañas -->
      <div class="row g-3 align-items-center mb-4">
        <!-- Pestañas Categoría -->
        <div class="col-md-6">
          <div class="btn-group w-100" role="group">
            <button class="btn" [ngClass]="currentTab === 'popular' ? 'btn-danger' : 'btn-outline-danger'" (click)="switchTab('popular')">
              <i class="bi bi-fire me-1"></i> Populares
            </button>
            <button class="btn" [ngClass]="currentTab === 'top_rated' ? 'btn-danger' : 'btn-outline-danger'" (click)="switchTab('top_rated')">
              <i class="bi bi-trophy-fill me-1"></i> Mejor Calificadas
            </button>
            <button class="btn" [ngClass]="currentTab === 'favorites' ? 'btn-danger' : 'btn-outline-danger'" (click)="switchTab('favorites')">
              <i class="bi bi-heart-fill me-1"></i> Favoritos
            </button>
          </div>
        </div>

        <!-- Selector de Géneros -->
        <div class="col-md-6" *ngIf="currentTab !== 'favorites'">
          <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="selectedGenreId" (change)="onGenreChange()">
            <option value="">Todos los Géneros</option>
            <option *ngFor="let genre of genres" [value]="genre.id">{{ genre.name }}</option>
          </select>
        </div>
      </div>

      <!-- Buscador por Título -->
      <div class="row justify-content-center mb-4" *ngIf="currentTab !== 'favorites'">
        <div class="col-md-8 col-lg-6">
          <div class="input-group shadow-sm">
            <span class="input-group-text bg-dark text-white border-secondary">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control bg-dark text-white border-secondary" 
              placeholder="Buscar película por título..."
              [(ngModel)]="searchQuery" 
              (ngModelChange)="onSearchChange($event)">
          </div>
        </div>
      </div>

      <!-- Spinner de Carga -->
      <div *ngIf="isLoading" class="text-center my-5 py-5">
        <div class="spinner-border text-danger" style="width: 3rem; height: 3rem;" role="status"></div>
        <p class="text-black-50 mt-3">Cargando películas...</p>
      </div>

      <!-- Error -->
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger text-center my-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      </div>

      <!-- Sin resultados -->
      <div *ngIf="!isLoading && !errorMessage && movies.length === 0" class="text-center my-5 py-5">
        <i class="bi bi-film display-1 text-white-50"></i>
        <h4 class="mt-3 text-black">No se encontraron películas favoritas</h4>
      </div>

      <!-- Grid Responsive -->
      <div *ngIf="!isLoading && movies.length > 0" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        <div class="col" *ngFor="let movie of movies">
          <app-movie-card [movie]="movie" (selectMovie)="openDetails($event)" (favoriteToggled)="onFavoriteToggled()"></app-movie-card>
        </div>
      </div>

      <!-- Controles de Paginación -->
      <div class="d-flex justify-content-center align-items-center gap-3 my-5" *ngIf="!isLoading && currentTab !== 'favorites' && movies.length > 0">
        <button class="btn btn-outline-black" [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">
          <i class="bi bi-chevron-left me-1"></i> Anterior
        </button>
        <span class="text-black-50 fw-bold">Página {{ currentPage }} de {{ totalPages }}</span>
        <button class="btn btn-outline-black" [disabled]="currentPage >= totalPages" (click)="changePage(currentPage + 1)">
          Siguiente <i class="bi bi-chevron-right ms-1"></i>
        </button>
      </div>
    </div>

    <!-- Modal de Detalles y Reseñas -->
    <div class="modal fade" id="movieDetailModal" tabindex="-1" aria-labelledby="movieDetailModalLabel">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content bg-dark text-white border-secondary" *ngIf="selectedMovie">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="movieDetailModalLabel">{{ selectedMovie.title }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4 mb-4">
              <div class="col-md-4 text-center">
                <img [src]="getPosterUrl(selectedMovie.poster_path)" [alt]="selectedMovie.title" class="img-fluid rounded shadow">
              </div>
              <div class="col-md-8">
                <div class="d-flex align-items-center mb-3">
                  <span class="badge bg-warning text-dark fs-6 me-3">
                    <i class="bi bi-star-fill me-1"></i>{{ selectedMovie.vote_average | number:'1.1-1' }}
                  </span>
                  <span class="text-white-50" *ngIf="selectedMovie.runtime">
                    <i class="bi bi-clock me-1"></i>{{ selectedMovie.runtime }} min
                  </span>
                </div>
                <h6 class="text-white"><strong>Sinopsis:</strong></h6>
                <p class="text-light">{{ selectedMovie.overview }}</p>
                <div class="mb-3" *ngIf="selectedMovie.genres && selectedMovie.genres.length > 0">
                  <h6 class="text-white"><strong>Géneros:</strong></h6>
                  <span *ngFor="let genre of selectedMovie.genres" class="badge bg-secondary me-1 mb-1">
                    {{ genre.name }}
                  </span>
                </div>
                <p class="text-white-50 small mb-0">
                  <strong class="text-white">Fecha de estreno:</strong> {{ selectedMovie.release_date || 'N/A' }}
                </p>
              </div>
            </div>

            <hr class="border-secondary my-4">

            <!-- Reseñas -->
            <div>
              <h5 class="mb-3 d-flex align-items-center text-white">
                <i class="bi bi-chat-square-quote-fill me-2 text-warning"></i> Reseñas de Usuarios
              </h5>

              <div *ngIf="isReviewsLoading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-warning" role="status"></div>
                <span class="ms-2 small text-white-50">Cargando reseñas...</span>
              </div>

              <div *ngIf="!isReviewsLoading && reviews.length === 0" class="alert alert-secondary text-center">
                No hay reseñas disponibles para esta película aún.
              </div>

              <div *ngIf="!isReviewsLoading && reviews.length > 0" class="d-flex flex-column gap-3">
                <div *ngFor="let review of reviews" class="card bg-secondary bg-opacity-25 border-secondary text-white p-3 rounded-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong class="text-warning"><i class="bi bi-person-circle me-1"></i>{{ review.author }}</strong>
                    <span class="badge bg-dark text-warning border border-warning" *ngIf="review.author_details?.rating">
                      <i class="bi bi-star-fill me-1"></i>{{ review.author_details?.rating }}/10
                    </span>
                  </div>
                  <p class="card-text small mb-1" style="white-space: pre-line; max-height: 150px; overflow-y: auto;">
                    {{ review.content }}
                  </p>
                  <span class="text-white-50 small align-self-end mt-1">
                    {{ review.created_at | date:'mediumDate' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MovieListComponent implements OnInit {
  private movieService: MovieService = inject(MovieService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  movies: Movie[] = [];
  genres: Genre[] = [];
  selectedMovie: Movie | null = null;
  reviews: Review[] = [];
  
  searchQuery: string = '';
  selectedGenreId: any = '';
  currentTab: 'popular' | 'top_rated' | 'favorites' = 'popular';
  
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  isReviewsLoading: boolean = false;
  errorMessage: string = '';

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadGenres();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((query: string) => {
      this.currentPage = 1;
      if (query.trim()) {
        this.executeSearch(query);
      } else {
        this.fetchCurrentTabMovies();
      }
    });

    this.fetchCurrentTabMovies();
  }

  loadGenres(): void {
    this.movieService.getGenres().subscribe({
      next: (res) => this.genres = res.genres || [],
      error: (err) => console.error('Error al cargar géneros:', err)
    });
  }

  switchTab(tab: 'popular' | 'top_rated' | 'favorites'): void {
    this.currentTab = tab;
    this.currentPage = 1;
    this.searchQuery = '';
    this.selectedGenreId = null;
    this.fetchCurrentTabMovies();
  }

  onGenreChange(): void {
    this.currentPage = 1;
    this.searchQuery = '';
    this.fetchCurrentTabMovies();
  }

fetchCurrentTabMovies(): void {
  if (this.currentTab === 'favorites') {
    this.movies = this.movieService.getFavorites();
    this.isLoading = false;
    this.cdr.detectChanges();
    return;
  }

  // Verifica que selectedGenreId sea un valor numérico válido y diferente de '', null o 'null'
  if (this.selectedGenreId && this.selectedGenreId !== '' && this.selectedGenreId !== 'null') {
    this.loadMoviesByGenre(Number(this.selectedGenreId), this.currentPage);
  } else if (this.currentTab === 'top_rated') {
    this.loadTopRatedMovies(this.currentPage);
  } else {
    this.loadPopularMovies(this.currentPage);
  }
}

  loadPopularMovies(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.movieService.getPopularMovies(page).subscribe({
      next: (data: any) => {
        const response: TMDBResponse<Movie> = typeof data === 'string' ? JSON.parse(data) : data;
        this.movies = response.results || [];
        this.totalPages = Math.min(response.total_pages || 1, 500); // TMDB limita las respuestas públicas a 500 páginas
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Error al obtener películas populares.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTopRatedMovies(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.movieService.getTopRatedMovies(page).subscribe({
      next: (data: any) => {
        const response: TMDBResponse<Movie> = typeof data === 'string' ? JSON.parse(data) : data;
        this.movies = response.results || [];
        this.totalPages = Math.min(response.total_pages || 1, 500);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Error al obtener películas mejor calificadas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMoviesByGenre(genreId: number, page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.movieService.getMoviesByGenre(genreId, page).subscribe({
      next: (data: any) => {
        const response: TMDBResponse<Movie> = typeof data === 'string' ? JSON.parse(data) : data;
        this.movies = response.results || [];
        this.totalPages = Math.min(response.total_pages || 1, 500);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Error al filtrar películas por género.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  executeSearch(query: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.movieService.searchMovies(query, this.currentPage).subscribe({
      next: (data: any) => {
        const response: TMDBResponse<Movie> = typeof data === 'string' ? JSON.parse(data) : data;
        this.movies = response.results || [];
        this.totalPages = Math.min(response.total_pages || 1, 500);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Error en la búsqueda.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      if (this.searchQuery.trim()) {
        this.executeSearch(this.searchQuery);
      } else {
        this.fetchCurrentTabMovies();
      }
    }
  }

  onFavoriteToggled(): void {
    if (this.currentTab === 'favorites') {
      this.movies = this.movieService.getFavorites();
      this.cdr.detectChanges();
    }
  }

  openDetails(movieId: number): void {
    this.selectedMovie = null;
    this.reviews = [];
    this.isReviewsLoading = true;

    forkJoin({
      movie: this.movieService.getMovieDetails(movieId),
      reviews: this.movieService.getMovieReviews(movieId)
    }).subscribe({
      next: (res: { movie: any, reviews: any }) => {
        const movieData: Movie = typeof res.movie === 'string' ? JSON.parse(res.movie) : res.movie;
        const reviewsData: TMDBResponse<Review> = typeof res.reviews === 'string' ? JSON.parse(res.reviews) : res.reviews;
        
        this.selectedMovie = movieData;
        this.reviews = reviewsData.results || [];
        this.isReviewsLoading = false;

        if (!this.selectedMovie.overview || this.selectedMovie.overview.trim() === '') {
          this.movieService.getMovieDetailsInEnglish(movieId).subscribe({
            next: (enMovie: any) => {
              const enData: Movie = typeof enMovie === 'string' ? JSON.parse(enMovie) : enMovie;
              if (this.selectedMovie && enData.overview) {
                this.selectedMovie.overview = enData.overview;
                this.cdr.detectChanges();
              }
            }
          });
        }

        this.cdr.detectChanges();

        const modalElement = document.getElementById('movieDetailModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      },
      error: (err: any) => {
        this.isReviewsLoading = false;
        alert(err.message || 'Error al obtener detalles.');
      }
    });
  }

  getPosterUrl(path: string | null | undefined): string {
    return this.movieService.getImageUrl(path);
  }
}