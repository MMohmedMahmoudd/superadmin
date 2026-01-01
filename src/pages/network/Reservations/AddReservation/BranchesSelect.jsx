import { useMemo, useEffect, useState } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { customStyles } from "../../Bussiness/AddBussiness/PersonNameSelect";
import axios from "axios";

const customMultiValueStyles = {
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f0f0f0",
    borderRadius: "9999px",
    padding: "2px 6px",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#333",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#333",
    fontWeight: "500",
    padding: "0 4px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#666",
    borderRadius: "50%",
    ":hover": {
      backgroundColor: "#F44336",
      color: "#fff",
      width: "20px",
      height: "20px",
      cursor: "pointer",
    },
  }),
};

const BranchesSelect = ({ formik }) => {
  const [providerBranches, setProviderBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProviderBranches = async () => {
      const providerId = formik.values.sp_uid;
      if (!providerId) {
        setProviderBranches([]);
        formik.setFieldValue("branch_uid", "");
        return;
      }

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

        const branches = response.data.data.branches || [];
        setProviderBranches(branches);
      } catch (error) {
        console.error("Error fetching provider branches:", error);
        setProviderBranches([]);
        formik.setFieldValue("branch_uid", "");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderBranches();
  }, [formik.values.sp_uid]);

  const branchOptions = useMemo(() => {
    const options = providerBranches.map((branch) => {
      let label = branch.name?.trim();
      if (!label) {
        label = branch.address?.trim() || branch.phone || "Unnamed Branch";
      }

      return {
        value: branch.id,
        label,
        fullData: branch,
      };
    });

    return options;
  }, [providerBranches]);

  return (
    <Select
      className="react-select"
      classNamePrefix="select"
      options={branchOptions}
      placeholder={loading ? "Loading branches..." : "Select Branch"}
      isMulti={false}
      closeMenuOnSelect={true}
      isLoading={loading}
      onBlur={() => {
        formik.setFieldTouched("branch_uid", true);
      }}
      value={
        branchOptions.find((opt) => opt.value === formik.values.branch_uid) ||
        null
      }
      onChange={(selectedOption) => {
        formik.setFieldValue(
          "branch_uid",
          selectedOption ? selectedOption.value : ""
        );
      }}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      styles={{ ...customStyles, ...customMultiValueStyles }}
      isDisabled={!formik.values.sp_uid || loading}
    />
  );
};

BranchesSelect.propTypes = {
  formik: PropTypes.object.isRequired,
};

export { BranchesSelect };
