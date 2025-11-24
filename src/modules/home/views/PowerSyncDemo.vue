<template>
  <F7Page>
    <F7Navbar
      transparent
      :sliding="true"
      large
      title="PowerSync Demo"
      class="!rounded-b-2xl"
      back-link
    >
      <F7NavRight sliding>
        <F7Link icon-ios="f7:arrow_clockwise" @click="refreshData"
          >Refresh</F7Link
        >
      </F7NavRight>
    </F7Navbar>

    <F7Block strong inset class="space-y-4">
      <div class="text-center">
        <h2 class="text-xl font-bold mb-2">PowerSync Live Data Demo</h2>
        <p class="text-sm text-gray-600">
          Demonstrating CRUD operations and live sync
        </p>
      </div>

      <!-- Login Section -->
      <div v-if="!isLoggedIn" class="p-4 bg-blue-50 rounded-lg">
        <h3 class="font-semibold mb-3">🔐 Login Required</h3>
        <p class="text-sm text-gray-600 mb-3">
          You must login with Supabase to connect to PowerSync
        </p>
        <F7Input
          v-model:value="loginEmail"
          type="email"
          placeholder="Email"
          class="mb-2"
        />
        <F7Input
          v-model:value="loginPassword"
          type="password"
          placeholder="Password"
          class="mb-2"
        />
        <div v-if="loginError" class="text-red-600 text-sm mb-2">
          {{ loginError }}
        </div>
        <F7Button fill @click="handleLogin">
          {{ isLoggingIn ? "Logging in..." : "Login" }}
        </F7Button>
        <p class="text-xs text-gray-500 mt-2">
          Demo credentials might be needed from your Supabase project
        </p>
      </div>

      <!-- Connection Status -->
      <div
        class="p-4 rounded-lg"
        :class="connected ? 'bg-green-100' : 'bg-red-100'"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold">Connection Status:</div>
            <span :class="connected ? 'text-green-700' : 'text-red-700'">
              {{ connected ? "🟢 Connected" : "🔴 Disconnected" }}
            </span>
            <div v-if="isLoggedIn" class="text-sm text-gray-600 mt-1">
              Logged in as: {{ userEmail }}
            </div>
          </div>
          <F7Button v-if="isLoggedIn" small color="red" @click="handleLogout">
            Logout
          </F7Button>
        </div>
      </div>

      <!-- Add New List (only show if logged in) -->
      <div v-if="isLoggedIn" class="p-4 bg-blue-50 rounded-lg">
        <h3 class="font-semibold mb-2">Create New List</h3>
        <F7Input
          v-model="newListName"
          type="text"
          placeholder="Enter list name"
          class="mb-2"
        />
        <F7Button fill @click="createList"> Create List </F7Button>
      </div>

      <!-- Lists -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold mb-3">Lists ({{ lists.length }})</h3>
        <div v-if="lists.length === 0" class="text-center text-gray-500 py-4">
          No lists yet. Create one above!
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="list in lists"
            :key="list.id"
            class="p-3 bg-white rounded border flex items-center justify-between"
          >
            <div class="flex-1">
              <div class="font-medium">{{ list.name }}</div>
              <div class="text-xs text-gray-500">
                ID: {{ list.id?.substring(0, 8) }}... | Created:
                {{ formatDate(list.created_at) }}
              </div>
              <div class="text-xs text-gray-500">
                Todos: {{ getTodoCount(list.id) }}
              </div>
            </div>
            <div class="flex gap-2">
              <F7Button small @click="addTodoToList(list.id)">+ Todo</F7Button>
              <F7Button small color="red" @click="deleteList(list.id)"
                >Delete</F7Button
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Todos -->
      <div class="p-4 bg-purple-50 rounded-lg">
        <h3 class="font-semibold mb-3">All Todos ({{ todos.length }})</h3>
        <div v-if="todos.length === 0" class="text-center text-gray-500 py-4">
          No todos yet. Add one to a list!
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="todo in todos"
            :key="todo.id"
            class="p-3 bg-white rounded border"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="!!todo.completed"
                    @change="toggleTodo(todo.id, todo.completed)"
                    class="w-4 h-4"
                  />
                  <span
                    :class="{ 'line-through text-gray-500': todo.completed }"
                  >
                    {{ todo.description }}
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  List ID: {{ todo.list_id?.substring(0, 8) }}... | Created:
                  {{ formatDate(todo.created_at) }}
                  <span v-if="todo.completed_at">
                    | Completed: {{ formatDate(todo.completed_at) }}
                  </span>
                </div>
              </div>
              <F7Button small color="red" @click="deleteTodo(todo.id)"
                >Delete</F7Button
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="p-4 bg-yellow-50 rounded-lg">
        <h3 class="font-semibold mb-2">Statistics</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>Total Lists: {{ lists.length }}</div>
          <div>Total Todos: {{ todos.length }}</div>
          <div>Completed: {{ completedTodos }}</div>
          <div>Pending: {{ todos.length - completedTodos }}</div>
        </div>
      </div>
    </F7Block>
  </F7Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { db, connector } from "@/shared/database/connector.database";
import type {
  ListRecord,
  TodoRecord,
} from "@/shared/database/schemas/AppSchema";

const lists = ref<ListRecord[]>([]);
const todos = ref<TodoRecord[]>([]);
const newListName = ref("");
const connected = ref(false);

// Login state
const isLoggedIn = ref(false);
const userEmail = ref("");
const loginEmail = ref("");
const loginPassword = ref("");
const loginError = ref("");
const isLoggingIn = ref(false);

let listsWatchAbort: AbortController | null = null;
let todosWatchAbort: AbortController | null = null;

// Computed
const completedTodos = computed(
  () => todos.value.length
);

const getTodoCount = (listId: string) => {
  return todos.value.length;
};

// Formatting
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};

// Authentication functions
const handleLogin = async () => {
  loginError.value = "";
  isLoggingIn.value = true;

  try {
    await connector.login(loginEmail.value, loginPassword.value);

    // Get the session to extract user email
    const {
      data: { session },
    } = await connector.client.auth.getSession();
    if (session?.user?.email) {
      userEmail.value = session.user.email;
      userId.value = session.user.id;
      isLoggedIn.value = true;
      loginEmail.value = "";
      loginPassword.value = "";

      // PowerSync will automatically retry connection now that credentials are available
      // Wait a bit for connection to establish
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check connection status
      checkConnection();

      // Start watching for live updates
      watchLists();
      watchTodos();

      // Load initial data
      await refreshData();
    }
  } catch (error: any) {
    loginError.value = error.message || "Login failed";
    console.error("Login error:", error);
  } finally {
    isLoggingIn.value = false;
  }
};

const handleLogout = async () => {
  // Stop watching
  listsWatchAbort?.abort();
  todosWatchAbort?.abort();

  // Sign out from Supabase
  await connector.client.auth.signOut();

  isLoggedIn.value = false;
  userEmail.value = "";
  connected.value = false;

  // Clear data
  lists.value = [];
  todos.value = [];
};

// Watch lists for live updates
const watchLists = async () => {
  listsWatchAbort = new AbortController();

  try {
    for await (const result of db.watch(
      "SELECT * FROM lists ORDER BY created_at DESC",
      [],
      { signal: listsWatchAbort.signal }
    )) {
      lists.value = result.rows as any as ListRecord[];
    }
  } catch (error) {
    // Aborted or error - ignore
  }
};

// Watch todos for live updates
const watchTodos = async () => {
  todosWatchAbort = new AbortController();

  try {
    for await (const result of db.watch(
      "SELECT * FROM todos ORDER BY created_at DESC",
      [],
      { signal: todosWatchAbort.signal }
    )) {
      todos.value = result.rows as any as TodoRecord[];
    }
  } catch (error) {
    // Aborted or error - ignore
  }
};

// CRUD Operations
const userId = ref("");


const createList = async () => {
  if (!newListName.value.trim()) return;

  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const owner = userId.value || "demo-user";

    await db.execute(
      "INSERT INTO lists (id, name, created_at, owner_id) VALUES (?, ?, ?, ?)",
      [id, newListName.value, now, owner]
    );

    newListName.value = "";
  } catch (error) {
    console.error("Failed to create list:", error);
    alert("Failed to create list. See console for details.");
  }
};

const deleteList = async (id: string) => {
  // Delete associated todos first
  await db.execute("DELETE FROM todos WHERE list_id = ?", [id]);
  // Delete list
  await db.execute("DELETE FROM lists WHERE id = ?", [id]);
};

const addTodoToList = async (listId: string) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const description = `Todo ${Math.floor(Math.random() * 1000)}`;

  await db.execute(
    "INSERT INTO todos (id, list_id, description, created_at, completed, created_by) VALUES (?, ?, ?, ?, ?, ?)",
    [id, listId, description, now, 0, userId.value || "demo-user"]
  );
};

const toggleTodo = async (id: string, currentCompleted: number | null) => {
  const completed = currentCompleted ? 0 : 1;
  const completedAt = completed ? new Date().toISOString() : null;
  const completedBy = completed ? "demo-user" : null;

  await db.execute(
    "UPDATE todos SET completed = ?, completed_at = ?, completed_by = ? WHERE id = ?",
    [completed, completedAt, completedBy, id]
  );
};

const deleteTodo = async (id: string) => {
  await db.execute("DELETE FROM todos WHERE id = ?", [id]);
};

const refreshData = async () => {
  // Force a refresh by re-querying
  const listsResult = await db.getAll(
    "SELECT * FROM lists ORDER BY created_at DESC"
  );
  lists.value = listsResult as any as ListRecord[];

  const todosResult = await db.getAll(
    "SELECT * FROM todos ORDER BY created_at DESC"
  );
  todos.value = todosResult as any as TodoRecord[];
};

// Check connection status
const checkConnection = () => {
  connected.value = db.connected;
};

onMounted(async () => {
  // Check for existing session
  try {
    const {
      data: { session },
    } = await connector.client.auth.getSession();
    if (session?.user?.email) {
      userEmail.value = session.user.email;
      userId.value = session.user.id;
      isLoggedIn.value = true;
    }
  } catch (error) {
    console.error("Session check error:", error);
  }

  // Check connection
  checkConnection();
  setInterval(checkConnection, 5000);

  // Start watching for live updates (only if logged in)
  if (isLoggedIn.value) {
    watchLists();
    watchTodos();
    await refreshData();
  }
});

onUnmounted(() => {
  // Stop watching
  listsWatchAbort?.abort();
  todosWatchAbort?.abort();
});
</script>
