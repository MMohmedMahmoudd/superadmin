import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { customStyles } from "../../Bussiness/AddBussiness/PersonNameSelect"; // Assuming this path is correct based on previous context
import PropTypes from "prop-types";

const RoleSelect = ({ formik, onRolesLoaded, group_uid }) => {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Assuming the response data structure is { success: boolean, message: string, data: [...] }
      setRoles(response.data?.data || []);
      if (onRolesLoaded) {
        onRolesLoaded(response.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
      if (onRolesLoaded) {
        onRolesLoaded([]);
      }
    } finally {
      setLoadingRoles(false);
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const options = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const selectedRole = options.find(
    (option) => String(option.value) === String(group_uid)
  );

  // Debug logs
  console.log("group_uid:", group_uid);
  console.log("options:", options);
  console.log("selectedRole:", selectedRole);

  return (
    <div className="flex flex-col gap-1">
      <label className="form-label mb-1">Role</label>
      <Select
        key={String(group_uid) + "-" + options.length}
        options={options}
        styles={customStyles}
        placeholder="Select Role"
        isLoading={loadingRoles}
        value={selectedRole}
        onChange={(selectedOption) => {
          formik.setFieldValue(
            "group_uid",
            selectedOption ? String(selectedOption.value) : ""
          );
        }}
        noOptionsMessage={() =>
          loadingRoles ? "Loading..." : "No roles available"
        }
      />
      {formik.touched.group_uid && formik.errors.group_uid && (
        <p className="text-red-500 text-xs mt-1">{formik.errors.group_uid}</p>
      )}
    </div>
  );
};

RoleSelect.propTypes = {
  formik: PropTypes.object.isRequired,
  onRolesLoaded: PropTypes.func,
  group_uid: PropTypes.string,
};

export default RoleSelect;
