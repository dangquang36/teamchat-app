"use client";

import { ChannelsSection } from "@/components/chat/1-n/gr/ChannelsSection";

export default function ChannelsPage() {
    const handleCreatePost = () => {
        console.log("Create Post button clicked from Channels page!");
        alert("Chức năng tạo bài đăng sẽ được thực hiện ở đây.");
    };

    return (
        <ChannelsSection onCreatePost={handleCreatePost} />
    );
}
