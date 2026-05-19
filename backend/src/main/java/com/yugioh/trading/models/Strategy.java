package com.yugioh.trading.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "strategies")
public class Strategy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String titleEn;
    private String titlePt;
    private String titleJa;

    @Column(columnDefinition = "TEXT")
    private String contentEn;

    @Column(columnDefinition = "TEXT")
    private String contentPt;

    @Column(columnDefinition = "TEXT")
    private String contentJa;

    private String videoUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }

    public String getTitlePt() { return titlePt; }
    public void setTitlePt(String titlePt) { this.titlePt = titlePt; }

    public String getTitleJa() { return titleJa; }
    public void setTitleJa(String titleJa) { this.titleJa = titleJa; }

    public String getContentEn() { return contentEn; }
    public void setContentEn(String contentEn) { this.contentEn = contentEn; }

    public String getContentPt() { return contentPt; }
    public void setContentPt(String contentPt) { this.contentPt = contentPt; }

    public String getContentJa() { return contentJa; }
    public void setContentJa(String contentJa) { this.contentJa = contentJa; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
