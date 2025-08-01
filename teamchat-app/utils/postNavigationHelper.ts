import { useRouter } from "next/navigation";

export function usePostNavigation() {
    const router = useRouter();

    const navigateToPost = (postId: string) => {
        console.log('🧭 Navigating to post:', postId);
        router.push(`/dashboard/posts/${postId}`);
    };

    const navigateToPostsPage = () => {
        console.log('🧭 Navigating to posts page');
        router.push('/dashboard/posts');
    };

    return {
        navigateToPost,
        navigateToPostsPage
    };
}