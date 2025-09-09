import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, CheckCircle, XCircle } from "lucide-react";

export default function RestaurantReviewList() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("pending"); // default filter

  // Mock static data
  const staticReviews = [
    {
      _id: "1",
      userId: "User123",
      typeId: "RestroA",
      star_value: 4,
      reviewComment: "Great food and service!",
      status: "pending",
    },
    {
      _id: "2",
      userId: "User456",
      typeId: "RestroB",
      star_value: 2,
      reviewComment: "Food was cold when served.",
      status: "accepted",
    },
    {
      _id: "3",
      userId: "User789",
      typeId: "RestroC",
      star_value: 5,
      reviewComment: "Absolutely loved it!",
      status: "denied",
    },
  ];

  // load filtered static reviews
  useEffect(() => {
    const filtered = staticReviews.filter((rev) => rev.status === status);
    setReviews(filtered);
  }, [status]);

  // Accept review (updates status locally)
  const handleAccept = (id) => {
    setReviews((prev) =>
      prev.map((rev) => (rev._id === id ? { ...rev, status: "accepted" } : rev))
    );
  };

  // Deny review (updates status locally)
  const handleDeny = (id) => {
    setReviews((prev) =>
      prev.map((rev) => (rev._id === id ? { ...rev, status: "denied" } : rev))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Reviews Management</h1>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-4">
        {["pending", "accepted", "denied"].map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">User</th>
                <th className="p-2">Restaurant</th>
                <th className="p-2">Stars</th>
                <th className="p-2">Comment</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev._id} className="border-b">
                  <td className="p-2">{rev.userId}</td>
                  <td className="p-2">{rev.typeId}</td>
                  <td className="p-2">{rev.star_value} ⭐</td>
                  <td className="p-2 truncate max-w-[200px]">
                    {rev.reviewComment}
                  </td>
                  <td className="p-2">{rev.status}</td>
                  <td className="p-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        (window.location.href = `/admin/reviews/${rev._id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 text-white"
                          onClick={() => handleAccept(rev._id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 text-white"
                          onClick={() => handleDeny(rev._id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
