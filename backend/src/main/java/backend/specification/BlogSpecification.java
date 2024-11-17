package backend.specification;

import backend.entity.Blog;
import backend.entity.Category;
import backend.entity.Tag;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;

public class BlogSpecification {
    public static Specification<Blog> hasCategory(String categoryTitle) {
        return (root, query, criteriaBuilder) -> {
            if (categoryTitle == null || categoryTitle.isEmpty()) {
                return null; // No filter applied if categoryTitle is null or empty
            }
            query.distinct(true); // Ensure distinct results
            Join<Blog, Category> categoryJoin = root.join("categories", JoinType.INNER);
            return criteriaBuilder.equal(categoryJoin.get("title"), categoryTitle);
        };
    }


    public static Specification<Blog> hasTag(String tagTitle) {
        return (root, query, criteriaBuilder) -> {
            if (tagTitle == null || tagTitle.isEmpty()) {
                return null; // No filter applied if tagTitle is null or empty
            }
            query.distinct(true); // Ensure distinct results
            Join<Blog, Tag> tagJoin = root.join("tags", JoinType.INNER);
            return criteriaBuilder.equal(tagJoin.get("title"), tagTitle);
        };
    }


    public static Specification<Blog> containsTitle(String title) {
        return ((root, query, criteriaBuilder) -> {
            if (title == null || title.isEmpty()) {
                return null;
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        });
    }


    public static Specification<Blog> hasAuthor(String author) {
        return ((root, query, criteriaBuilder) -> {
            if (author == null || author.isEmpty()) {
                return null;
            }
            Join<Object, Object> userJoin = root.join("user");
            return criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("username")), "%" + author.toLowerCase() + "%");
        });
    }
}
