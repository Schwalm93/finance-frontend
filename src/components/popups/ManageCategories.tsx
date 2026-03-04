import React, { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { Category } from "../../models/category";
import "./ModalTheme.css";

type Props = {
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
};

const DEFAULT_CATEGORY_COLOR = "#64748b";

export const ManageCategories: React.FC<Props> = ({ categories, onClose, onChanged }) => {
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [updatedCategoryColor, setUpdatedCategoryColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

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
        body: JSON.stringify({ name: trimmed, color: newCategoryColor }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setNewCategory("");
      setNewCategoryColor(DEFAULT_CATEGORY_COLOR);
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
      setErrorMessage("Bitte Kategorie auswählen und Namen oder Farbe anpassen.");
      return;
    }

    setIsLoading(true);
    resetError();

    try {
      const response = await fetch(API_ENDPOINTS.updateCategory, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldCategory,
          newCategory: newCategoryName,
          color: updatedCategoryColor,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setSelectedCategory(newCategoryName);
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
      setUpdatedCategoryColor(DEFAULT_CATEGORY_COLOR);
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
            Erstelle, benenne um oder ändere die Farbe einer Kategorie direkt im Workflow.
          </p>
        </div>
      </Modal.Header>
      <Modal.Body className="app-modal__body">
        <Form className="app-modal__stack">
          <div className="app-modal__surface app-modal__stack">
            <div>
              <h3 className="app-modal__section-title">Neue Kategorie anlegen</h3>
              <p className="app-modal__section-copy">
                Füge eine neue Kategorie hinzu und vergebe direkt eine Farbe für das Tag.
              </p>
            </div>

            <div className="app-modal__grid app-modal__grid--two">
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

              <Form.Group>
                <Form.Label>Farbe</Form.Label>
                <Form.Control
                  type="color"
                  value={newCategoryColor}
                  onChange={(event) => {
                    setNewCategoryColor(event.target.value);
                    resetError();
                  }}
                />
              </Form.Group>
            </div>

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
                Wähle eine vorhandene Kategorie aus und passe Namen oder Farbe an.
              </p>
            </div>

            <div className="app-modal__grid app-modal__grid--two">
              <Form.Group>
                <Form.Label>Kategorie auswählen</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(event) => {
                    const nextCategory = sortedCategories.find(
                      (category) => category.name === event.target.value
                    );

                    setSelectedCategory(event.target.value);
                    setUpdatedCategoryName(nextCategory?.name ?? "");
                    setUpdatedCategoryColor(nextCategory?.color ?? DEFAULT_CATEGORY_COLOR);
                    resetError();
                  }}
                >
                  <option value="">Kategorie auswählen</option>
                  {sortedCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
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

              <Form.Group>
                <Form.Label>Farbe</Form.Label>
                <Form.Control
                  type="color"
                  value={updatedCategoryColor}
                  onChange={(event) => {
                    setUpdatedCategoryColor(event.target.value);
                    resetError();
                  }}
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
