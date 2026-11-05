package com.wellfair.movies.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class TmdbService {

    private final RestClient restClient;

    public TmdbService(
            @Value("${tmdb.api.url}") String apiUrl,
            @Value("${tmdb.api.token}") String apiToken) {
        
        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiToken)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String getPopularMovies(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/popular")
                        .queryParam("language", "es-MX")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getTopRatedMovies(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/top_rated")
                        .queryParam("language", "es-MX")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getGenres() {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/genre/movie/list")
                        .queryParam("language", "es-MX")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMoviesByGenre(Long genreId, int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("language", "es-MX")
                        .queryParam("with_genres", genreId)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String searchMovies(String query, int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("language", "es-MX")
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieDetails(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}")
                        .queryParam("language", "es-MX")
                        .build(movieId))
                .retrieve()
                .body(String.class);
    }

    // Método que faltaba en el servicio
    public String getMovieDetailsInEnglish(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}")
                        .queryParam("language", "en-US")
                        .build(movieId))
                .retrieve()
                .body(String.class);
    }

    public String getMovieReviews(Long movieId) {
        String spanishReviews = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}/reviews")
                        .queryParam("language", "es-MX")
                        .build(movieId))
                .retrieve()
                .body(String.class);

        if (spanishReviews != null && !spanishReviews.contains("\"results\":[]")) {
            return spanishReviews;
        }

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}/reviews")
                        .queryParam("language", "en-US")
                        .build(movieId))
                .retrieve()
                .body(String.class);
    }
}