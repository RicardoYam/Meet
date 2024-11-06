package backend.specification;

import backend.entity.Blog;
import backend.entity.Category;
import backend.entity.Tag;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Join;

public class BlogSpecification {
    public static Specification<Blog> hasCategory(String categoryTitle) {
        return (root, query, criteriaBuilder) -> {
            if (categoryTitle == null || categoryTitle.isEmpty()) {
                return null;
            }
            Join<Blog, Category> categoryJoin = root.join("categories");
            return criteriaBuilder.equal(categoryJoin.get("title"), categoryTitle);
        };
    }

    public static Specification<Blog> hasTag(String tagTitle) {
        return (root, query, criteriaBuilder) -> {
            if (tagTitle == null || tagTitle.isEmpty()) {
                return null;
            }
            Join<Blog, Tag> tagJoin = root.join("tags");
            return criteriaBuilder.equal(tagJoin.get("title"), tagTitle);
        };
    }
}
