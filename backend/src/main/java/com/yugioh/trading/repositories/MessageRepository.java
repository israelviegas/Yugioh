package com.yugioh.trading.repositories;

import com.yugioh.trading.models.Message;
import com.yugioh.trading.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(User user1, User user2);

    @Query("SELECT m FROM Message m WHERE m.id IN (" +
           "  SELECT MAX(m2.id) FROM Message m2 " +
           "  WHERE m2.sender = :user OR m2.receiver = :user " +
           "  GROUP BY CASE WHEN m2.sender = :user THEN m2.receiver.id ELSE m2.sender.id END" +
           ") ORDER BY m.createdAt DESC")
    List<Message> findInbox(User user);

    long countByReceiverAndIsReadFalse(User receiver);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markAsRead(User sender, User receiver);

}
