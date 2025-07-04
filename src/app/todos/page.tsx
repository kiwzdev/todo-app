"use client";

import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import AddTodoForm from "@/components/Todo/AddTodoForm";
import EditTodoModal from "@/components/Todo/EditTodoModal";
import FilterSection from "@/components/Todo/FilterSection";
import TodoCard from "@/components/Todo/TodoCard";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useTodos } from "@/hooks/useTodos";
import { motion } from "framer-motion";

export default function TodosPage() {
  const {
    filteredTodos,
    todoStats,
    isLoading,
    filters,
    setFilters,
    handleAddTodo,
    handleUpdateTodo,
    isAdding,
    isUpdating,
    isModalOpen,
    openEditModal,
    closeEditModal,
    formErrors,
    editingFormErrors,
    handleToggleCompleted,
    handleDeleteTodo,
    newTodoData,
    setNewTodoData,
    editTodoData,
    setEditTodoData,
  } = useTodos();

  const status = useAuthRedirect();

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddTodo();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateTodo();
  };

  if (status === "loading") return <Loading />;
  if (status !== "authenticated") return null;

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="min-h-screen px-4 py-8 bg-gray-50 dark:bg-gray-950">
          <div className="md:mx-25 max-w-6xl mx-auto">
            {/* Add Todo Form */}
            <AddTodoForm
              newTodoData={newTodoData}
              setNewTodoData={setNewTodoData}
              formErrors={formErrors}
              onSubmit={handleAddSubmit}
              isAdding={isAdding}
            />

            {/* Edit Todo Modal */}
            <EditTodoModal
              isOpen={isModalOpen}
              onClose={closeEditModal}
              editTodoData={editTodoData}
              setEditTodoData={setEditTodoData}
              editingFormErrors={editingFormErrors}
              onSubmit={handleEditSubmit}
              isUpdating={isUpdating}
            />

            {/* Todo List Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
                  My Todos
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {todoStats.completed} of {todoStats.total} completed (
                  {todoStats.completionRate}%)
                </div>
              </div>

              {/* Filters */}
              <FilterSection filters={filters} setFilters={setFilters} />

              {/* Todo Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTodos.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <p className="text-2xl text-gray-500 dark:text-gray-400">
                      No todos found
                    </p>
                  </div>
                ) : isLoading ? (
                  <Loading />
                ) : (
                  filteredTodos.map((todo) => (
                    <TodoCard
                      key={todo._id}
                      todo={todo}
                      onToggleCompleted={handleToggleCompleted}
                      onEdit={openEditModal}
                      onDelete={handleDeleteTodo}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}
