import type { NextApiRequest, NextApiResponse } from "next";

interface Post {
  id: number;
  title: string;
  content: string;
}

const posts: Post[] = [
  { id: 1, title: "First post", content: "This is my first post" },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post[] | Post>
) {
  if (req.method === "GET") {
    res.status(200).json(posts);
  } else if (req.method === "POST") {
    const newPost: Post = { ...req.body, id: posts.length + 1 };
    posts.push(newPost);
    res.status(201).json(newPost);
  }
}
