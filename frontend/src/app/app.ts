import { Component } from '@angular/core';
import { MovieListComponent } from './components/movie-list/movie-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MovieListComponent],
  template: `
    <nav class="navbar navbar-dark bg-black shadow-sm mb-4">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center fw-bold text-danger" href="#">
          <i class="bi bi-camera-reels-fill fs-3 me-2"></i> WellFair Movies
        </a>
      </div>
    </nav>
    <main>
      <app-movie-list></app-movie-list>
    </main>
  `
})
export class AppComponent {}