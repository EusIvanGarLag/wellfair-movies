package com.wellfair.movies.controller;

import com.wellfair.movies.service.TmdbService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/movies")
@CrossOrigin(origins = "http://localhost:4200")
public class MovieController {

    private final TmdbService tmdbService;

    public MovieController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @GetMapping(value = "/popular", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getPopular(@RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(tmdbService.getPopularMovies(page));
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> search(@RequestParam String query, @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(tmdbService.searchMovies(query, page));
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(tmdbService.getMovieDetails(id));
    }

    @GetMapping(value = "/{id}/reviews", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(tmdbService.getMovieReviews(id));
    }

    @GetMapping(value = "/{id}/en", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getDetailsInEnglish(@PathVariable Long id) {
        return ResponseEntity.ok(tmdbService.getMovieDetailsInEnglish(id));
    }

    @GetMapping(value = "/top-rated", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getTopRated(@RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(tmdbService.getTopRatedMovies(page));
    }

    @GetMapping(value = "/genres", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getGenres() {
        return ResponseEntity.ok(tmdbService.getGenres());
    }

    @GetMapping(value = "/genre/{genreId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getByGenre(@PathVariable Long genreId, @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(tmdbService.getMoviesByGenre(genreId, page));
    }
}