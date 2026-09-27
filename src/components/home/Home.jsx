/* eslint-disable no-unused-vars */
import { useContext } from "react";
import { authContext } from "./../authContext/AuthContext";
import { useEffect, useState } from "react";
import Postcard from "./../postcard/Postcard";
import axios from "axios";
import { Spinner } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorPage from "./../errorPage/ErrorPage";
import CreatePost from "./../createPost/CreatePost";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const { token } = useContext(authContext);
  const queryClient = useQueryClient();

  async function getAllPosts() {
    return axios.get("https://route-posts.routemisr.com/posts", {
      headers: { token },
    });
  }

  const { data, isLoading, isError, isFetched } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
    select: (res) => res.data.data.posts,
  });

  // console.log("isLoading", isLoading)
  // console.log("isError", isError)
  // console.log("isFetched", isFetched)

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <ErrorPage />;
  }

  // The user Clicks the delete button rendered in the (PostCard) component
  // identify the post to delete by it's ID
  // if the request succeeds , Re render the page so it gets removed from the screen

  async function handlePostDelete(postId) {
    try {
      await axios.delete(`https://route-posts.routemisr.com/posts/${postId}`, {
        headers: { token },
      });

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post Deleted!");
    } catch (error) {
      console.log(error);
    }
  }

  async function handlePostEdit(postId, newBody) {
    try {
      await axios.put(
        `https://route-posts.routemisr.com/posts/${postId}`,
        { body: newBody },
        { headers: { token } },
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast.success("Post Edited Succesfully!");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Helmet>
        <title>Home Feed</title>
      </Helmet>

      <CreatePost token={token} />

      {data?.map((post) => (
        <Postcard
          key={post.id || post.user._id}
          post={post}
          token={token}
          onDelete={handlePostDelete}
          onEdit={handlePostEdit}
        />
      ))}
    </>
  );
}
