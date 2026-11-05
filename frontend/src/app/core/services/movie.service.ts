import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Movie, Genre, Review, TMDBResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private backendUrl = environment.backendApiUrl;
  private imageBaseUrl = environment.tmdbImageBaseUrl || 'https://image.tmdb.org/t/p/w500';
  private FAVORITES_KEY = 'wellfair_favorite_movies';

  getPopularMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<TMDBResponse<Movie>>(`${this.backendUrl}/popular`, { params }).pipe(catchError(this.handleError));
  }

  getTopRatedMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<TMDBResponse<Movie>>(`${this.backendUrl}/top-rated`, { params }).pipe(catchError(this.handleError));
  }

  getGenres(): Observable<{ genres: Genre[] }> {
    return this.http.get<{ genres: Genre[] }>(`${this.backendUrl}/genres`).pipe(catchError(this.handleError));
  }

  getMoviesByGenre(genreId: number, page: number = 1): Observable<TMDBResponse<Movie>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<TMDBResponse<Movie>>(`${this.backendUrl}/genre/${genreId}`, { params }).pipe(catchError(this.handleError));
  }

  searchMovies(query: string, page: number = 1): Observable<TMDBResponse<Movie>> {
    const params = new HttpParams().set('query', query).set('page', page.toString());
    return this.http.get<TMDBResponse<Movie>>(`${this.backendUrl}/search`, { params }).pipe(catchError(this.handleError));
  }

  getMovieDetails(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.backendUrl}/${id}`).pipe(catchError(this.handleError));
  }

  getMovieDetailsInEnglish(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.backendUrl}/${id}/en`).pipe(catchError(this.handleError));
  }

  getMovieReviews(id: number): Observable<TMDBResponse<Review>> {
    return this.http.get<TMDBResponse<Review>>(`${this.backendUrl}/${id}/reviews`).pipe(catchError(this.handleError));
  }

  // LÓGICA DE FAVORITOS (localStorage)
  getFavorites(): Movie[] {
    const data = localStorage.getItem(this.FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  }

  isFavorite(movieId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some(m => m.id === movieId);
  }

  toggleFavorite(movie: Movie): boolean {
    let favorites = this.getFavorites();
    const index = favorites.findIndex(m => m.id === movie.id);

    if (index >= 0) {
      favorites.splice(index, 1);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
      return false; // Ya no es favorito
    } else {
      favorites.push(movie);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
      return true; // Agregado a favoritos
    }
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path || path === 'null' || path.trim() === '') {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" fill="%23333" viewBox="0 0 16 16"%3E%3Crect width="100%25" height="100%25" fill="%23212529"/%3E%3Ctext x="50%25" y="50%25" fill="%23aaa" dy=".3em" text-anchor="middle" font-family="sans-serif" font-size="24"%3ESin Poster%3C/text%3E%3C/svg%3E';
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.imageBaseUrl}${cleanPath}`;
  }

  private handleError(error: any) {
    console.error('Error HTTP:', error);
    return throwError(() => new Error('Error al conectar con el backend de películas.'));
  }
}