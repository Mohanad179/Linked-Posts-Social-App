/* eslint-disable no-unused-vars */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authContext } from "../authContext/AuthContext";
import Postcard from "./../postcard/Postcard";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "./../errorPage/ErrorPage";
import { Helmet } from "react-helmet-async";

export default function PostData() {
  let { postId } = useParams();
  // console.log("postId from useParams:", postId)
  const { token } = useContext(authContext);

  // let [isLoading, setisLoading] = useState(true)
  // const [post, setPost] = useState(null)
  // const [error, setError] = useState(null)

  async function getSinglePost() {
    return axios.get(`https://route-posts.routemisr.com/posts/${postId}`, {
      headers: { token },
    });
  }

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["postData", postId],
    queryFn: getSinglePost,
    select: (res) => res.data.data.post,
  });

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

  console.log(post);

  return (
    <>
      <Helmet>
        <title>
          {post?.user?.name ? `Post | ${post.user.name}` : "Loading..."}
        </title>
      </Helmet>

      {isLoading ? (
        <div className="flex h-screen justify-center items-center">
          {" "}
          <Spinner size="lg" />{" "}
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <Postcard post={post} token={token} defaultShowComments={true} />
      )}
    </>
  );
}

// 1- link the date to the postData component with the postId
// 2- add the postData component to the router
// 3- configure the postData component
// 4- fetch the url with the id as a variable then render postcard inside postData to get the single post with it's id
