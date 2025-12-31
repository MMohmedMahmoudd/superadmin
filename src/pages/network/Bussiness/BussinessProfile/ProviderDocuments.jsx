import { useEffect, useState } from "react";
import axios from "axios";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";
import { Modal } from "@mui/material";
import { useSnackbar } from "notistack";

const ProviderDocuments = ({ providerId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
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
        `${import.meta.env.VITE_APP_API_URL}/providers/${providerId}/documents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const files = response.data.data || [];

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
          url,
        };
      });

      console.log("parsedDocs", parsedDocs);

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

  const handleDelete = async (idx) => {
    const token = JSON.parse(
      localStorage.getItem(
        import.meta.env.VITE_APP_NAME +
          "-auth-v" +
          import.meta.env.VITE_APP_VERSION
      )
    )?.access_token;

    setLoading(true);

    const res = await axios.delete(
      `${import.meta.env.VITE_APP_API_URL}/providers/${providerId}/delete-documents/${idx + 1}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setLoading(false);

    if (res.status === 200) {
      enqueueSnackbar("Document deleted successfully!", {
        variant: "success",
      });
      setDocuments((prev) => prev.filter((_, index) => index !== idx));
    } else {
      enqueueSnackbar("Failed to delete document!", {
        variant: "error",
      });
    }
  };

  const handleFileChange = async (file) => {
    const data = new FormData();
    data.append("documents[]", file);

    const token = JSON.parse(
      localStorage.getItem(
        import.meta.env.VITE_APP_NAME +
          "-auth-v" +
          import.meta.env.VITE_APP_VERSION
      )
    )?.access_token;

    await axios.postForm(
      `${import.meta.env.VITE_APP_API_URL}/providers/${providerId}/update-documents`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    enqueueSnackbar("Document added successfully!", {
      variant: "success",
    });

    fetchDocuments();
  };

  return (
    <div className="card p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Documents</h3>
        <div className="flex gap-2">
          {/* <button className="btn btn-outline btn-primary btn-sm">
            <KeenIcon icon="exit-down" className="mr-1" /> Download All
          </button> */}
          <label className="btn btn-outline btn-primary  btn-sm">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept=".jpg, .jpeg, .png"
            />
            <KeenIcon icon="plus" className="mr-1" /> Add New
          </label>
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
                  onClick={() => handleDelete(idx)}
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
