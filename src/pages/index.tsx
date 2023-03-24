import type { NextPage } from "next";
import Head from "next/head";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { API, graphqlOperation } from "aws-amplify";
import { listPosts } from "../graphql/queries";
import { createPost } from "../graphql/mutations";
import styles from "../../styles/Home.module.css";
import { onCreatePost } from "../graphql/subscriptions";
import * as mutations from "../graphql/mutations";
import { DeletePostInput } from "../API";

const Home: NextPage = () => {
  const [formData, setFormData] = useState({
    index: 0,
    title: "",
    content: "",
  });
  const [posts, setPosts] = useState<any>([]);
  const onChange = (event: any) => {
    const {
      target: { name, value },
    } = event;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const callPosts = async () => {
    const request = await API.graphql(graphqlOperation(listPosts));
    setPosts(request.data.listPosts.items);
  };
  const onSubmit = async (event: any) => {
    event.preventDefault();
    await API.graphql(graphqlOperation(createPost, { input: formData }));
  };

  const realTimePosts = () => {
    API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: ({ value: { data } }: any) =>
        setPosts((prev: any) => [
          { ...data.onCreatePost, index: posts.length },
          ...prev,
        ]),
    });
  };

  const deletePosts = async (id: any) => {
    console.log(id);
    const deleteId: DeletePostInput = {
      id,
    };
    const result = await API.graphql({
      query: mutations.deletePost,
      variables: { input: deleteId },
    });
  };
  useEffect(() => {
    callPosts();
    realTimePosts();
  }, []);
  // useEffect(() => {
  //   realTimePosts();
  // }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>GraphQL Test</h1>
        <section>
          <h3>Post something!</h3>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="title"
              placeholder="what is the title"
              required
              onChange={(e) => onChange(e)}
              value={formData.title}
            />
            <textarea
              name="content"
              required
              placeholder="what is content"
              onChange={(e) => onChange(e)}
              value={formData.content}
            ></textarea>
            <button>Post</button>
          </form>
        </section>
        <hr />
        <section>
          <h3>Timeline</h3>
          <div>
            {posts
              .sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((item: any) => (
                <article key={item.id}>
                  <div className={styles.box}>
                    <h3>{item.index}</h3>
                    <h4>{item.title}</h4>
                    <h5>{item.content}</h5>
                    <h5>{item.createdAt}</h5>
                    <button onClick={() => deletePosts(item.id)}>Delete</button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
