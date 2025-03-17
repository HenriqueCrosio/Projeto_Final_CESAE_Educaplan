"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { enrollmentDataService, EnrollmentDetails } from "@/services/wrapper-services/enrollment-data.wrapper-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EnrollmentDetailPage = () => {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [enrollmentDetails, setEnrollmentDetails] = useState<EnrollmentDetails | null>(null);

  const fetchData = () => {
    const data = enrollmentDataService.getEnrollmentDetailsBySlug(slug);
    setEnrollmentDetails(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Enrollment Details</h1>
      <Button onClick={fetchData}>Load Data</Button>

      {enrollmentDetails ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Enrollment Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(enrollmentDetails, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <p className="mt-4 text-red-500">No enrollment data found.</p>
      )}
    </div>
  );
};

export default EnrollmentDetailPage;
