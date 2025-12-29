import { useEffect, useState } from "react";
import axios from "axios";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";

const ProviderDocuments = ({ providerId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const files = response.data.data.license_image || [];
      const sp_add_date = response.data.data.sp_add_date;

      const parsedDocs = files.map((url) => {
        const fileName = url.split("/").pop();
        const extension = fileName?.split(".").pop()?.toLowerCase();
        let image = "";

        if (["jpg", "jpeg", "png"].includes(extension)) {
          image = url;
        } else {
          let icon = "file.svg";
          if (extension === "pdf") icon = "pdf.svg";
          else if (extension === "doc" || extension === "docx")
            icon = "doc.svg";
          else if (extension === "js") icon = "js.svg";
          else if (extension === "ai") icon = "ai.svg";

          image = toAbsoluteUrl(`/media/file-types/${icon}`);
        }

        return {
          image,
          name: fileName,
          date: new Date(sp_add_date).toLocaleDateString(),
          url,
        };
      });

      setDocuments(parsedDocs);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) fetchDocuments();
  }, [providerId]);

  const handleDownload = (url) => {
    window.open(url, "_blank");
  };

  const handleDelete = (url) => {
    setDocuments((prev) => prev.filter((doc) => doc.url !== url));
  };

  return (
    <div className="card p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Documents</h3>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-primary btn-sm">
            <KeenIcon icon="exit-down" className="mr-1" /> Download All
          </button>
          <button className="btn btn-outline btn-primary  btn-sm">
            <KeenIcon icon="plus" className="mr-1" /> Add New
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-muted">No documents found.</p>
        ) : (
          documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border rounded p-4 shadow-sm "
            >
              <div className="flex items-center gap-3">
                <img
                  src={doc.image}
                  alt="icon"
                  className="w-10 h-10 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(doc.url)}
                  className="text-blue-600"
                >
                  <KeenIcon icon="exit-down" />
                </button>
                <button
                  onClick={() => handleDelete(doc.url)}
                  className="text-red-600"
                >
                  <KeenIcon icon="trash" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { ProviderDocuments };
