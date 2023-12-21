function handleCheckboxClick () {
    const isChecked = this.checked;
    if (isChecked) {
        this.value = "true"
    } else {
        this.value = "false"
    }
}