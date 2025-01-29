import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFileExport,
  faTrash,
  faEdit,
  faToggleOn,
  faToggleOff,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  fetchEntities,
  bulkActivateEntities,
  bulkDeactivateEntities,
  bulkDeleteEntities,
  deleteEntity,
  exportToExcel,
} from "../features/entitiesSlice";
import "./ListView.css";
import { toast } from "sonner";
import Swal from 'sweetalert2';

const ListView = () => {
  const dispatch = useDispatch();
  const { entities, total, status } = useSelector((state) => state.entities);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'inactive'

  // Fetch data whenever filters change
  useEffect(() => {
    dispatch(fetchEntities({ page, search, showDeleted, status: filterStatus }));
  }, [dispatch, page, search, showDeleted, filterStatus]);

  const handleSearch = (e) => setSearch(e.target.value);
  const handleToggleSelection = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Dispatch delete action
        await dispatch(deleteEntity(id));

        // Refetch entities to update the list
        dispatch(fetchEntities({ page, search, showDeleted, status: filterStatus }));

        // Success toast
        Swal.fire('Deleted!', 'Entity deleted successfully.', 'success');
      }
    });
  };
  

  const handleExportToExcel = async () => {
    try {
      await dispatch(exportToExcel()).unwrap();
      toast.success("Export successful!");
    } catch (error) {
      console.error("Export failed:", error.message);
      toast.error("Export failed");
    }
  };
  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      toast.warning("No entities selected");
      return;
    }

    if (action === "activate") {
      dispatch(bulkActivateEntities(selectedIds)).then(() => {
        dispatch(fetchEntities({ page, search, showDeleted, status: filterStatus }));
        toast.success("Selected entities activated!");
      });
    } else if (action === "deactivate") {
      dispatch(bulkDeactivateEntities(selectedIds)).then(() => {
        dispatch(fetchEntities({ page, search, showDeleted, status: filterStatus }));
        toast.success("Selected entities deactivated!");
      });
    } else if (action === "delete") {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This will permanently delete the selected entities.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete them!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await dispatch(bulkDeleteEntities(selectedIds));
          dispatch(fetchEntities({ page, search, showDeleted, status: filterStatus }));
          Swal.fire('Deleted!', 'Selected entities have been permanently deleted.', 'success');
        }
      });
    }
  };

  // 🔹 Frontend filtering in case backend filtering isn't available
  const filteredEntities = entities.filter((entity) =>
    filterStatus === "all"
      ? true
      : filterStatus === "active"
      ? entity.status.toLowerCase() === "active"
      : entity.status.toLowerCase() === "inactive"
  );

  return (
    <div className="list-view">
      <h1>Manage Entities</h1>
      <div className="controls">
        <input type="text" placeholder="Search..." value={search} onChange={handleSearch} />
        <Link to="/add">
          <button className="add-btn">
            <FontAwesomeIcon icon={faPlus} /> Add Entity
          </button>
        </Link>
        <button onClick={() => handleExportToExcel()} className="export-btn">
          <FontAwesomeIcon icon={faFileExport} /> Export to Excel
        </button>
      </div>

      {/* 🔹 Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          Show All
        </button>
        <button
          className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
          onClick={() => setFilterStatus("active")}
        >
          <FontAwesomeIcon icon={faToggleOn} /> Show Active
        </button>
        <button
          className={`filter-btn ${filterStatus === "inactive" ? "active" : ""}`}
          onClick={() => setFilterStatus("inactive")}
        >
          <FontAwesomeIcon icon={faToggleOff} /> Show Inactive
        </button>
      </div>

      {status === "loading" && <p>Loading...</p>}

      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedIds(e.target.checked ? filteredEntities.map((e) => e._id) : [])
                }
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Registration Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntities.map((entity) => (
            <tr key={entity._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(entity._id)}
                  onChange={() => handleToggleSelection(entity._id)}
                />
              </td>
              <td>{`${entity.firstName} ${entity.lastName}`}</td>
              <td>{entity.email}</td>
              <td>{new Date(entity.createdDate).toLocaleString()}</td>
              <td>{entity.status}</td>
              <td>
                <Link to={`/edit/${entity._id}`}>
                  <button className="edit-btn">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </Link>
                <button className="delete-btn" onClick={() => handleDelete(entity._id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Previous
        </button>
        <span>Page {page}</span>
        <button disabled={filteredEntities.length === 0} onClick={() => setPage(page + 1)}>
          Next <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="bulk-actions">
        <button onClick={() => handleBulkAction("activate")}>
          <FontAwesomeIcon icon={faToggleOn} /> Bulk Activate
        </button>
        <button onClick={() => handleBulkAction("deactivate")}>
          <FontAwesomeIcon icon={faToggleOff} /> Bulk Deactivate
        </button>
        <button onClick={() => handleBulkAction("delete")}>
          <FontAwesomeIcon icon={faTrash} /> Bulk Delete
        </button>
      </div>
    </div>
  );
};

export default ListView;
