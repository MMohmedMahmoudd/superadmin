import { useMemo, useEffect, useState } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { customStyles } from "../../Bussiness/AddBussiness/PersonNameSelect";
import axios from "axios";

const customMultiValueStyles = {
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f0f0f0", // Badge background
    borderRadius: "9999px", // Full rounded
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

const BranchesSelect = ({ offer, selectedCity, formik, providerId }) => {
  const [providerBranches, setProviderBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("🔍 BranchesSelect rendered with:", {
    hasOffer: !!offer,
    hasBranches: !!offer?.branches,
    branchesCount: offer?.branches?.length,
    providerId,
    selectedCity,
    branches: offer?.branches,
    fullOffer: offer,
  });

  useEffect(() => {
    // If we have branches from the offer response, use those
    if (offer?.branches && offer.branches.length > 0) {
      console.log("🔍 Using branches from offer:", offer.branches);
      setProviderBranches(offer.branches);
      return;
    }

    console.log("🔍 Fetching branches from provider profile, offer:", offer);

    // Otherwise, fetch from provider profile
    const fetchProviderBranches = async () => {
      if (!providerId) {
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

        // Extract branches from the provider profile response
        const branches = response.data.data.branches || [];
        setProviderBranches(branches);
      } catch (error) {
        console.error("Error fetching provider branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderBranches();
  }, [providerId, offer]);

  const normalizeLabel = (name, fallback) => {
    if (!name) return fallback;
    if (typeof name === "string") return name.trim();
    // Handle backend returning { en, ar }
    if (typeof name === "object") {
      return name.en?.trim() || name.ar?.trim() || fallback;
    }
    return fallback;
  };

  const normalizeCityName = (name) => {
    if (!name) return "";
    if (typeof name === "string") return name.trim();
    if (typeof name === "object")
      return name.en?.trim() || name.ar?.trim() || "";
    return "";
  };

  const branches = useMemo(() => {
    // Show all available branches for the provider, not just previously selected ones
    const options = providerBranches.map((branch) => {
      let label = normalizeLabel(branch.name, "");
      if (!label) {
        label = branch.address?.trim() || branch.phone || "Unnamed Branch";
      }

      return {
        value: branch.id,
        label,
        cityName: normalizeCityName(branch.city?.name) || "",
        fullData: branch,
      };
    });

    return [
      { value: "all", label: "All Branches", cityName: "All" },
      ...options,
    ];
  }, [providerBranches]);

  const filteredBranches = useMemo(() => {
    // Normalize selectedCity to ensure it's always a string
    const normalizedCity =
      typeof selectedCity === "string"
        ? selectedCity
        : typeof selectedCity === "object" && selectedCity !== null
          ? selectedCity.en?.trim() || selectedCity.ar?.trim() || ""
          : "";

    if (!normalizedCity || normalizedCity.toLowerCase() === "all cities") {
      return branches;
    }
    return branches.filter(
      (branch) =>
        branch.cityName?.toLowerCase() === normalizedCity.toLowerCase()
    );
  }, [branches, selectedCity]);

  const selectedBranches = useMemo(() => {
    if (
      !formik.values.branches_id ||
      !Array.isArray(formik.values.branches_id)
    ) {
      return [];
    }
    const selected = filteredBranches.filter((opt) => {
      const optValue = opt.value.toString();
      const isSelected = formik.values.branches_id.some(
        (id) => id.toString() === optValue
      );
      return isSelected;
    });
    console.log("🔍 BranchesSelect - selectedBranches:", {
      branches_id: formik.values.branches_id,
      filteredBranches: filteredBranches,
      selected: selected,
    });
    return selected;
  }, [filteredBranches, formik.values.branches_id]);

  return (
    <Select
      className="react-select"
      classNamePrefix="select"
      options={filteredBranches}
      placeholder={loading ? "Loading branches..." : "Select Branch"}
      isMulti={true}
      closeMenuOnSelect={false}
      isLoading={loading}
      onBlur={() => {
        formik.setFieldTouched("branches_id", true);
      }}
      value={selectedBranches}
      onChange={(selectedOptions) => {
        if (!selectedOptions) {
          formik.setFieldValue("branches_id", []);
          return;
        }

        const selectedValues = selectedOptions.map((option) => option.value);

        if (selectedValues.includes("all")) {
          formik.setFieldValue("branches_id", ["all"]);
        } else {
          formik.setFieldValue("branches_id", selectedValues);
        }
      }}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      styles={{ ...customStyles, ...customMultiValueStyles }}
    />
  );
};

BranchesSelect.propTypes = {
  offer: PropTypes.shape({
    branches: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
        phone: PropTypes.string,
        address: PropTypes.string,
        city: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
        }),
      })
    ),
  }).isRequired,
  formik: PropTypes.object.isRequired,
  selectedCity: PropTypes.string,
  providerId: PropTypes.string,
};

export { BranchesSelect };
