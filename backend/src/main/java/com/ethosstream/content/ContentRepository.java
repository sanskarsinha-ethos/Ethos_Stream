package com.ethosstream.content;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentRepository extends JpaRepository<Video, UUID> {

    @Query("SELECT v FROM Video v WHERE v.isFeatured = true ORDER BY v.createdAt DESC")
    List<Video> findByIsFeaturedTrue();

    @Query("SELECT DISTINCT v FROM Video v JOIN v.genres g WHERE g.slug = :genreSlug")
    Page<Video> findByGenreSlug(@Param("genreSlug") String genreSlug, Pageable pageable);

    @Query("SELECT v FROM Video v WHERE LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Video> searchByTitle(@Param("search") String search, Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v JOIN v.genres g " +
           "WHERE g.slug = :genreSlug AND LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Video> findByGenreSlugAndSearch(@Param("genreSlug") String genreSlug,
                                         @Param("search") String search,
                                         Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v JOIN v.genres g WHERE g.id IN :genreIds")
    Page<Video> findByGenreIds(@Param("genreIds") List<Integer> genreIds, Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v JOIN v.genres g WHERE g.id IN :genreIds AND v.id NOT IN :excludeIds")
    Page<Video> findByGenreIdsExcluding(@Param("genreIds") List<Integer> genreIds,
                                        @Param("excludeIds") List<UUID> excludeIds,
                                        Pageable pageable);

    @Modifying
    @Query("UPDATE Video v SET v.viewCount = v.viewCount + :count WHERE v.id = :videoId")
    void incrementViewCount(@Param("videoId") UUID videoId, @Param("count") long count);
}
