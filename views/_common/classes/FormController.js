export const FormControllerPrototype = {
    read() {
        return Object.fromEntries(new FormData(this.form).entries());
    },

    setLoading(isLoading, loadingText = "Salvando...") {
        const button = this.form.querySelector('[type="submit"]');
        if (!button) return;

        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
            button.disabled = true;
        } else {
            button.textContent = button.dataset.originalText || button.textContent;
            button.disabled = false;
        }
    },

    clear() {
        this.form.reset();
    }
};

export function createFormController(form) {
    const controller = Object.create(FormControllerPrototype);
    controller.form = form;
    return controller;
}
