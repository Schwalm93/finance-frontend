import React, { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "./ModalTheme.css";

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
    <Modal
      show={true}
      onHide={onClose}
      centered
      dialogClassName="app-modal__dialog"
      contentClassName="app-modal__content"
    >
      <Modal.Header closeButton className="app-modal__header">
        <div className="app-modal__title-wrap">
          <span className="app-modal__eyebrow">Kategorien</span>
          <Modal.Title className="app-modal__title">Kategorien verwalten</Modal.Title>
          <p className="app-modal__subtitle">
            Erstelle, benenne um oder entferne Kategorien direkt aus dem
            Workflow heraus.
          </p>
        </div>
      </Modal.Header>
      <Modal.Body className="app-modal__body">
        <Form className="app-modal__stack">
          <div className="app-modal__surface app-modal__stack">
            <div>
              <h3 className="app-modal__section-title">Neue Kategorie anlegen</h3>
              <p className="app-modal__section-copy">
                Füge schnell eine neue Kategorie hinzu, damit sie direkt in der
                Transaktionsübersicht verfügbar ist.
              </p>
            </div>

            <Form.Group>
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
            </Form.Group>

            <Button
              className="app-modal__button"
              onClick={addCategory}
              disabled={isLoading}
            >
              Erstellen
            </Button>
          </div>

          <div className="app-modal__divider"></div>

          <div className="app-modal__surface app-modal__stack">
            <div>
              <h3 className="app-modal__section-title">Bestehende Kategorie ändern</h3>
              <p className="app-modal__section-copy">
                Wähle eine vorhandene Kategorie aus und aktualisiere Namen oder
                Löschstatus.
              </p>
            </div>

            <div className="app-modal__grid app-modal__grid--two">
              <Form.Group>
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

              <Form.Group>
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
            </div>

            <div className="app-modal__actions">
              <Button
                variant="dark"
                className="app-modal__button"
                onClick={updateCategory}
                disabled={isLoading}
              >
                Aktualisieren
              </Button>
              <Button
                variant="danger"
                className="app-modal__button-danger"
                onClick={deleteCategory}
                disabled={isLoading}
              >
                Löschen
              </Button>
            </div>

            {errorMessage && <p className="text-danger mb-0">{errorMessage}</p>}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="app-modal__footer">
        <div className="app-modal__actions">
          <Button
            variant="light"
            className="app-modal__button-outline"
            onClick={onClose}
            disabled={isLoading}
          >
          Schließen
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
