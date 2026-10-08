document.addEventListener('DOMContentLoaded', () => {
    const userTable = document.getElementById('userTable');
    const roleTable = document.getElementById('roleTable');
    const userTableSearch = document.getElementById('userTableSearch');
    const roleTableSearch = document.getElementById('roleTableSearch');
    const mainSearch = document.getElementById('mainSearch');
    const roleDialog = document.getElementById('roleDialog');
    const roleForm = document.getElementById('roleForm');
    const roleDialogTitle = document.getElementById('roleDialogTitle');
    const addRoleButton = document.getElementById('addRoleButton');
    const cancelRoleButton = document.getElementById('cancelRoleButton');
    const userDialog = document.getElementById('userDialog');
    const userForm = document.getElementById('userForm');
    const userDialogTitle = document.getElementById('userDialogTitle');
    const cancelUserButton = document.getElementById('cancelUserButton');
    const refreshTime = document.querySelector('.refresh-time');
    const refreshButton = document.querySelector('.refresh');
    const exportButton = document.querySelector('.export');
    const addUserButton = document.getElementById('addUserButton');
    const deleteButtons = document.querySelectorAll('.delete');
    const menuLinks = document.querySelectorAll('.menu a');
    const paginationGroups = document.querySelectorAll('.pagination');

    function showToast(message) {
        let toast = document.querySelector('.toast-message');

        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.style.position = 'fixed';
            toast.style.right = '18px';
            toast.style.bottom = '18px';
            toast.style.background = '#0f5f5d';
            toast.style.color = '#fff';
            toast.style.padding = '10px 14px';
            toast.style.borderRadius = '8px';
            toast.style.fontSize = '11px';
            toast.style.zIndex = '1000';
            toast.style.boxShadow = '0 8px 18px rgba(0, 0, 0, 0.18)';
            toast.style.transition = 'opacity 0.25s ease';
            toast.style.opacity = '0';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';
        clearTimeout(toast.timeoutId);
        toast.timeoutId = setTimeout(() => {
            toast.style.opacity = '0';
        }, 1800);
    }

    menuLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            menuLinks.forEach((item) => item.classList.toggle('active', item === link));
        });
    });

    function setRefreshTime() {
        const now = new Date();
        const hour = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        refreshTime.textContent = `◷ Last Refreshed: ${hour}:${minutes}`;
    }

    refreshButton.addEventListener('click', () => {
        refreshButton.textContent = '⟳ Refreshing...';
        setRefreshTime();
        setTimeout(() => {
            refreshButton.textContent = '⟳ Refresh';
            showToast('Dashboard refreshed');
        }, 700);
    });

    exportButton.addEventListener('click', () => {
        const rows = [...userTable.querySelectorAll('tbody tr')].map((row) => ({
            userId: row.children[1].textContent.trim(),
            name: row.children[2].textContent.trim(),
            email: row.children[3].textContent.trim(),
            role: row.children[4].textContent.trim(),
            status: row.children[5].textContent.trim()
        }));

        const csv = [
            ['User ID', 'Name', 'Email', 'Role', 'Status'],
            ...rows.map((row) => [row.userId, row.name, row.email, row.role, row.status])
        ]
            .map((values) => values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'user-report.csv';
        link.click();
        URL.revokeObjectURL(url);
        showToast('User data exported');
    });

    function filterTable(table, query) {
        const searchText = query.trim().toLowerCase();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row) => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchText) ? '' : 'none';
        });
    }

    if (userTableSearch) {
        userTableSearch.addEventListener('input', (event) => {
            filterTable(userTable, event.target.value);
        });
    }

    if (mainSearch) {
        mainSearch.addEventListener('input', (event) => {
            filterTable(userTable, event.target.value);
        });
    }

    if (roleTableSearch) {
        roleTableSearch.addEventListener('input', (event) => {
            filterTable(roleTable, event.target.value);
        });
    }

    function updateUserSummary() {
        const userCount = userTable.querySelectorAll('tbody tr').length;
        const activeCount = [...userTable.querySelectorAll('tbody tr')]
            .filter((row) => row.children[5].textContent.trim() === 'Active').length;
        const inactiveCount = userCount - activeCount;
        const summary = userTable.closest('.panel')?.querySelector('.pagination span');
        const totalUserCount = document.getElementById('totalUserCount');
        const activeUserCount = document.getElementById('activeUserCount');
        const inactiveUserCount = document.getElementById('inactiveUserCount');

        if (totalUserCount) {
            totalUserCount.textContent = String(userCount);
        }
        if (activeUserCount) {
            activeUserCount.textContent = String(activeCount);
        }
        if (inactiveUserCount) {
            inactiveUserCount.textContent = String(inactiveCount);
        }
        if (summary) {
            summary.textContent = `Showing 1 to ${Math.min(userCount, 10)} of ${userCount} users`;
        }
    }

    function updateRoleSummary() {
        const roleCount = roleTable.querySelectorAll('tbody tr').length;
        const summary = roleTable.closest('.panel')?.querySelector('.pagination span');

        if (summary) {
            summary.textContent = `Showing 1 to ${Math.min(roleCount, 10)} of ${roleCount} roles`;
        }
    }

    function openRoleDialog(row) {
        roleForm.dataset.editingId = row ? row.children[1].textContent.trim() : '';
        roleDialogTitle.textContent = row ? 'Edit Role' : 'Add Role';
        roleForm.elements.roleName.value = row ? row.children[2].textContent.trim() : '';
        roleForm.elements.roleDescription.value = row ? row.children[3].textContent.trim() : '';
        roleForm.elements.roleStatus.value = row ? row.children[4].textContent.trim() : 'Active';
        roleForm.elements.rolePermissions.value = row ? row.children[5].textContent.trim() : '';
        roleDialog.showModal();
        roleForm.elements.roleName.focus();
    }

    function makeRoleCell(text) {
        const cell = document.createElement('td');
        cell.textContent = text;
        return cell;
    }

    function openUserDialog(row) {
        userForm.dataset.editingId = row ? row.children[1].textContent.trim() : '';
        userDialogTitle.textContent = row ? 'Edit User' : 'Add User';
        userForm.elements.userName.value = row ? row.children[2].textContent.trim() : '';
        userForm.elements.userEmail.value = row ? row.children[3].textContent.trim() : '';
        userForm.elements.userRole.value = row ? row.children[4].textContent.trim() : 'User';
        userForm.elements.userStatus.value = row ? row.children[5].textContent.trim() : 'Active';
        userDialog.showModal();
        userForm.elements.userName.focus();
    }

    function makeUserRow(userId, name, email, role, status) {
        const row = document.createElement('tr');
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox);

        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status ${status === 'Active' ? 'active-status' : 'inactive-status'}`;
        statusBadge.textContent = status;
        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'row-edit';
        editButton.setAttribute('aria-label', `Edit ${name}`);
        editButton.textContent = '✎';
        actionCell.appendChild(editButton);

        row.append(
            checkboxCell,
            makeRoleCell(userId),
            makeRoleCell(name),
            makeRoleCell(email),
            makeRoleCell(role),
            statusCell,
            actionCell
        );
        return row;
    }

    function makeRoleRow(roleId, roleName, description, status, permissions) {
        const row = document.createElement('tr');
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox);

        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status ${status === 'Active' ? 'active-status' : 'inactive-status'}`;
        statusBadge.textContent = status;
        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'row-edit';
        editButton.setAttribute('aria-label', `Edit ${roleName} role`);
        editButton.textContent = '✎';
        actionCell.appendChild(editButton);

        row.append(
            checkboxCell,
            makeRoleCell(roleId),
            makeRoleCell(roleName),
            makeRoleCell(description),
            statusCell,
            makeRoleCell(permissions),
            actionCell
        );
        return row;
    }

    roleTable.querySelectorAll('tbody tr').forEach((row) => {
        const actionCell = row.lastElementChild;
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'row-edit';
        editButton.setAttribute('aria-label', `Edit ${row.children[2].textContent.trim()} role`);
        editButton.textContent = '✎';
        actionCell.replaceChildren(editButton);
    });

    addRoleButton.addEventListener('click', () => openRoleDialog(null));
    cancelRoleButton.addEventListener('click', () => roleDialog.close());

    userTable.querySelectorAll('tbody tr').forEach((row) => {
        const actionCell = row.lastElementChild;
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'row-edit';
        editButton.setAttribute('aria-label', `Edit ${row.children[2].textContent.trim()}`);
        editButton.textContent = '✎';
        actionCell.replaceChildren(editButton);
    });

    addUserButton.addEventListener('click', () => openUserDialog(null));
    cancelUserButton.addEventListener('click', () => userDialog.close());

    userTable.querySelector('tbody').addEventListener('click', (event) => {
        const editButton = event.target.closest('.row-edit');
        if (editButton) {
            openUserDialog(editButton.closest('tr'));
        }
    });

    userForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const editingId = userForm.dataset.editingId;
        const name = userForm.elements.userName.value.trim();
        const email = userForm.elements.userEmail.value.trim();
        const role = userForm.elements.userRole.value;
        const status = userForm.elements.userStatus.value;

        if (!name || !email) {
            userForm.reportValidity();
            return;
        }

        if (editingId) {
            const row = [...userTable.querySelectorAll('tbody tr')]
                .find((item) => item.children[1].textContent.trim() === editingId);

            if (!row) {
                showToast('User could not be found');
                return;
            }

            row.replaceWith(makeUserRow(editingId, name, email, role, status));
        } else {
            const userNumbers = [...userTable.querySelectorAll('tbody tr td:nth-child(2)')]
                .map((cell) => Number(cell.textContent.trim().replace(/\D/g, '')) || 0);
            const nextId = `USR${String(Math.max(0, ...userNumbers) + 1).padStart(3, '0')}`;
            userTable.querySelector('tbody').appendChild(makeUserRow(nextId, name, email, role, status));
        }

        userDialog.close();
        userForm.reset();
        userForm.dataset.editingId = '';
        filterTable(userTable, userTableSearch.value);
        updateUserSummary();
        showToast(editingId ? 'User updated' : 'New user added');
    });

    roleTable.querySelector('tbody').addEventListener('click', (event) => {
        const editButton = event.target.closest('.row-edit');
        if (editButton) {
            openRoleDialog(editButton.closest('tr'));
        }
    });

    roleForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const editingId = roleForm.dataset.editingId;
        const roleName = roleForm.elements.roleName.value.trim();
        const description = roleForm.elements.roleDescription.value.trim();
        const status = roleForm.elements.roleStatus.value;
        const permissions = roleForm.elements.rolePermissions.value.trim();

        if (!roleName || !description || !permissions) {
            roleForm.reportValidity();
            return;
        }

        if (editingId) {
            const row = [...roleTable.querySelectorAll('tbody tr')]
                .find((item) => item.children[1].textContent.trim() === editingId);

            if (!row) {
                showToast('Role could not be found');
                return;
            }

            row.replaceWith(makeRoleRow(editingId, roleName, description, status, permissions));
        } else {
            const roleNumbers = [...roleTable.querySelectorAll('tbody tr td:nth-child(2)')]
                .map((cell) => Number(cell.textContent.trim().replace(/\D/g, '')) || 0);
            const nextId = `ROL${String(Math.max(0, ...roleNumbers) + 1).padStart(3, '0')}`;
            roleTable.querySelector('tbody').appendChild(
                makeRoleRow(nextId, roleName, description, status, permissions)
            );
        }

        roleDialog.close();
        roleForm.reset();
        roleForm.dataset.editingId = '';
        filterTable(roleTable, roleTableSearch.value);
        updateRoleSummary();
        showToast(editingId ? 'Role updated' : 'New role added');
    });

    deleteButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const panel = button.closest('.panel');
            const table = panel ? panel.querySelector('table') : null;

            if (!table) {
                return;
            }

            const checked = [...table.querySelectorAll('tbody input[type="checkbox"]:checked')];

            if (checked.length === 0) {
                showToast('Select rows to delete');
                return;
            }

            checked.forEach((checkbox) => {
                const row = checkbox.closest('tr');
                if (row) {
                    row.remove();
                }
            });

            if (table.id === 'userTable') {
                updateUserSummary();
            } else if (table.id === 'roleTable') {
                updateRoleSummary();
            }

            showToast('Selected rows deleted');
        });
    });

    paginationGroups.forEach((group) => {
        const buttons = group.querySelectorAll('button');

        buttons.forEach((button) => {
            if (button.textContent.includes('Back') || button.textContent.includes('Next')) {
                return;
            }

            button.addEventListener('click', () => {
                buttons.forEach((item) => item.classList.toggle('selected', item === button));
            });
        });
    });

    const aiButtons = document.querySelectorAll('.ai-box button, .floating-ai');
    aiButtons.forEach((button) => {
        button.addEventListener('click', () => {
            showToast('AI assistant is ready to help');
        });
    });

    setRefreshTime();
    updateUserSummary();
    updateRoleSummary();
});
