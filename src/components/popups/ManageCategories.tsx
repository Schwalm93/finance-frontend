import React, { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { API_ENDPOINTS } from "../../api/apiConfig";

type Props = {
  categories: string[];
  onClose: () => void;
  onChanged: () => void;
};

export const ManageCategories: React.FC<Props> = ({ categories, onClose, onChanged }) => {
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.localeCompare(b)), [categories]);

  const resetError = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const addCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setErrorMessage("Bitte einen Kategorienamen eingeben.");
      return;
    }

    setIsLoading(true);
    resetError();

    try {
      const response = await fetch(API_ENDPOINTS.addCategory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setNewCategory("");
      onChanged();
    } catch (error) {
      console.error("Fehler beim Erstellen der Kategorie:", error);
      setErrorMessage("Kategorie konnte nicht erstellt werden.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async () => {
    const oldCategory = selectedCategory.trim();
    const newCategoryName = updatedCategoryName.trim();

    if (!oldCategory || !newCategoryName) {
      setErrorMessage("Bitte Kategorie auswählen und neuen Namen eingeben.");
      return;
    }

    setIsLoading(true);
    resetError();

    try {
      const response = await fetch(API_ENDPOINTS.updateCategory, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldCategory, newCategory: newCategoryName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setUpdatedCategoryName("");
      onChanged();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Kategorie:", error);
      setErrorMessage("Kategorie konnte nicht aktualisiert werden.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async () => {
    const category = selectedCategory.trim();
    if (!category) {
      setErrorMessage("Bitte eine Kategorie auswählen.");
      return;
    }

    setIsLoading(true);
    resetError();

    try {
      const response = await fetch(API_ENDPOINTS.deleteCategory, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: category }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setSelectedCategory("");
      setUpdatedCategoryName("");
      onChanged();
    } catch (error) {
      console.error("Fehler beim Löschen der Kategorie:", error);
      setErrorMessage("Kategorie konnte nicht gelöscht werden.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Kategorien verwalten</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Neue Kategorie</Form.Label>
            <Form.Control
              type="text"
              value={newCategory}
              onChange={(event) => {
                setNewCategory(event.target.value);
                resetError();
              }}
              placeholder="z. B. Freizeit"
            />
            <Button className="mt-2" onClick={addCategory} disabled={isLoading}>
              Erstellen
            </Button>
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label>Kategorie auswählen</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                resetError();
              }}
            >
              <option value="">Kategorie auswählen</option>
              {sortedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Neuer Name</Form.Label>
            <Form.Control
              type="text"
              value={updatedCategoryName}
              onChange={(event) => {
                setUpdatedCategoryName(event.target.value);
                resetError();
              }}
              placeholder="z. B. Food"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" onClick={updateCategory} disabled={isLoading}>
              Aktualisieren
            </Button>
            <Button variant="danger" onClick={deleteCategory} disabled={isLoading}>
              Löschen
            </Button>
          </div>

          {errorMessage && <p className="text-danger mt-3 mb-0">{errorMessage}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Schließen
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
