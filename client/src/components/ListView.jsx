import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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

const ListView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { entities, total, status } = useSelector((state) => state.entities);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    dispatch(fetchEntities({ page, search, showDeleted }));
  }, [dispatch, page, search, showDeleted]);

  const handleSearch = (e) => setSearch(e.target.value);
  const handleToggleSelection = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entity?")) {
      await dispatch(deleteEntity(id));
      dispatch(fetchEntities({ page, search, showDeleted }));
    }
  };

 
const handleExportToExcel = async () => {
  try {
    await dispatch(exportToExcel()).unwrap();
    alert("✅ Export successful");
  } catch (error) {
    console.error("❌ Export failed:", error.message);
    alert("❌ Export failed");
  }
};

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      alert("No entities selected");
      return;
    }

    if (action === "activate") {
      dispatch(bulkActivateEntities(selectedIds)).then(() =>
        dispatch(fetchEntities({ page, search, showDeleted }))
      );
    } else if (action === "deactivate") {
      dispatch(bulkDeactivateEntities(selectedIds)).then(() =>
        dispatch(fetchEntities({ page, search, showDeleted }))
      );
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete the selected entities?")) {
        dispatch(bulkDeleteEntities(selectedIds)).then(() => {
          dispatch(fetchEntities({ page, search, showDeleted }));
        
        });
      }
    }
  };

  return (
    <div className="list-view">
      <aside className="sidebar">
        <h2>Deleted Entities</h2>
        <button onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? "Hide Deleted" : "Show Deleted"}
        </button>
      </aside>

      <main className="content">
        <h1>Manage Entities</h1>

        <div className="controls">
          <input type="text" placeholder="Search..." value={search} onChange={handleSearch} />
          <Link to="/add">
            <button className="add-btn">
              <FontAwesomeIcon icon={faPlus} /> Add Entity
            </button>
          </Link>
          <button onClick={handleExportToExcel} className="export-btn">
    <FontAwesomeIcon icon={faFileExport} /> Export to Excel
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
                    setSelectedIds(e.target.checked ? entities.map((e) => e._id) : [])
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
            {entities.map((entity) => (
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
          <button disabled={entities.length === 0} onClick={() => setPage(page + 1)}>
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
      </main>
    </div>
  );
};

export default ListView;
