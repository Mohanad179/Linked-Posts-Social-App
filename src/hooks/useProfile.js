import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export function useProfile(token) {
    return useQuery({
        queryKey: ["profile", token],
        queryFn: () => axios.get("https://route-posts.routemisr.com/users/profile-data", {
            headers: { token }
        }),
        select: (res) => res.data.data.user
    })
}